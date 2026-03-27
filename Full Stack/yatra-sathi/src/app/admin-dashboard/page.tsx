'use client';

/**
 * Admin Dashboard — approve/deny property requests, manage live properties.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, Shield, CheckCircle, XCircle, Trash2, Loader2,
  LogOut, Image as ImageIcon, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import {
  getPendingRequests, approveRequest, denyRequest,
  getAllProperties, deleteProperty,
  type PropertyRequest,
} from '@/lib/firestoreService';
import type { Property } from '@/types/property';

type Tab = 'pending' | 'live';

export default function AdminDashboardPage() {
  const { profile, loading, signOut, firebaseUser } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('pending');
  const [pending, setPending] = useState<PropertyRequest[]>([]);
  const [liveProps, setLiveProps] = useState<Property[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!firebaseUser || profile?.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, firebaseUser, profile, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      refreshData();
    }
  }, [profile]);

  const refreshData = async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/properties')
      ]);
      const requests = await rRes.json();
      const pData = await pRes.json();
      
      setPending(Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending') : []);
      setLiveProps(Array.isArray(pData.properties) ? pData.properties : []);
    } catch (err) {}
  };

  const handleApprove = async (req: any) => {
    setActionLoading(req.reqId);
    try {
      // 1. Add to properties.json
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...req,
          owner: { name: req.ownerName || 'Unknown', contact: '', verified: true },
          images: [req.image_url],
        })
      });

      // 2. Update request status in requests.json
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reqId: req.reqId, status: 'approved' })
      });

      await refreshData();
    } catch (err) {}
    setActionLoading(null);
  };

  const handleDeny = async (reqId: string) => {
    setActionLoading(reqId);
    try {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reqId, status: 'denied' })
      });
      await refreshData();
    } catch (err) {}
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this property from the map permanently?')) return;
    setActionLoading(id);
    try {
      await fetch('/api/properties', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await refreshData();
    } catch (err) {}
    setActionLoading(null);
  };

  if (loading) return <div className="dash-loading"><Loader2 size={28} className="spin" /> Loading…</div>;
  if (!profile || profile.role !== 'admin') return null;

  return (
    <div className="dash-page">
      <header className="dash-header">
        <div className="dash-header-left">
          <Shield size={22} />
          <span className="dash-header-title">Admin Dashboard</span>
        </div>
        <div className="dash-header-right">
          <span className="dash-user-name">{profile.name}</span>
          <button className="dash-signout" onClick={signOut}><LogOut size={16} /> Sign Out</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          Pending Requests ({pending.length})
        </button>
        <button className={`admin-tab ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>
          Live Properties ({liveProps.length})
        </button>
      </div>

      <main className="dash-content admin-scroll">
        {/* Pending Requests */}
        {tab === 'pending' && (
          <section className="dash-section">
            {pending.length === 0 && <p className="req-empty">No pending requests.</p>}
            {pending.map((req) => (
              <div key={req.reqId} className="admin-req-card">
                <div className="admin-req-head" onClick={() => setExpandedReq(expandedReq === req.reqId ? null : req.reqId)}>
                  <div>
                    <span className="admin-req-title">{req.title}</span>
                    <span className="admin-req-meta">{req.type} · ₹{req.rent_price?.toLocaleString('en-IN')}/mo · {req.ownerName}</span>
                  </div>
                  {expandedReq === req.reqId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {expandedReq === req.reqId && (
                  <div className="admin-req-detail">
                    <div className="admin-req-grid">
                      <div><strong>Address:</strong> {req.location?.address}</div>
                      <div><strong>Area:</strong> {req.location?.area}</div>
                      <div><strong>BHK:</strong> {req.bhk || '-'}</div>
                      <div><strong>Gender:</strong> {req.gender_preference}</div>
                      <div><strong>Available:</strong> {req.available_from || 'Immediately'}</div>
                      <div><strong>Lat/Lng:</strong> {req.location?.lat}, {req.location?.lng}</div>
                    </div>

                    <div className="admin-req-images">
                      {req.image_url && (
                        <div className="admin-img-box">
                          <ImageIcon size={12} /> Property Image
                          <img src={req.image_url} alt="Property" className="admin-img" />
                        </div>
                      )}
                      {req.papersImageUrl && (
                        <div className="admin-img-box">
                          <FileText size={12} /> Ownership Papers
                          <img src={req.papersImageUrl} alt="Papers" className="admin-img" />
                        </div>
                      )}
                    </div>

                    <div className="admin-req-actions">
                      <button
                        className="dash-btn dash-btn-approve"
                        disabled={actionLoading === req.reqId}
                        onClick={() => handleApprove(req)}
                      >
                        {actionLoading === req.reqId ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                        Approve
                      </button>
                      <button
                        className="dash-btn dash-btn-deny"
                        disabled={actionLoading === req.reqId}
                        onClick={() => handleDeny(req.reqId)}
                      >
                        <XCircle size={14} /> Deny
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Live Properties */}
        {tab === 'live' && (
          <section className="dash-section">
            {liveProps.length === 0 && <p className="req-empty">No live properties.</p>}
            <div className="live-grid">
              {liveProps.map((prop) => (
                <div key={prop.id} className="live-card">
                  {prop.image_url && <img src={prop.image_url} alt={prop.title} className="live-card-img" />}
                  <div className="live-card-body">
                    <h3 className="live-card-title">{prop.title}</h3>
                    <p className="live-card-meta">{prop.type}{prop.bhk ? ' ' + prop.bhk + 'BHK' : ''} · ₹{(prop.rent_price || 0).toLocaleString('en-IN')}/mo</p>
                    <p className="live-card-addr">{prop.location.address}</p>
                    <button
                      className="dash-btn dash-btn-danger"
                      disabled={actionLoading === prop.id}
                      onClick={() => handleDelete(prop.id)}
                    >
                      {actionLoading === prop.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
