'use client';

/**
 * Owner Dashboard — refined UI with scrollable form, mandatory fields,
 * base64 image caching, and Mapbox location picker.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Home, Plus, MapPin, Upload, Clock, CheckCircle, XCircle,
  Loader2, Image as ImageIcon, ChevronDown, ChevronUp, LogOut, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import {
  submitPropertyRequest, getOwnerRequests,
  type PropertyRequest,
} from '@/lib/firestoreService';

const IN_UNIT_OPTIONS = ['wifi', 'attached_bathroom', 'ac', 'laundry', 'refrigerator', 'tv', 'geyser', 'wardrobe'];
const SHARED_OPTIONS = ['parking', 'kitchen', 'common_room', 'gym', 'garden', 'security', 'elevator', 'power_backup'];

/** Convert a File to a base64 data URL */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function OwnerDashboardPage() {
  const { profile, loading, firebaseUser } = useAuth();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'PG' | 'FLAT' | 'HOUSE'>('FLAT');
  const [bhk, setBhk] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [gender, setGender] = useState('any');
  const [inUnit, setInUnit] = useState<string[]>([]);
  const [shared, setShared] = useState<string[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [propertyImage, setPropertyImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Requests
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequests, setShowRequests] = useState(true);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    // We can still use Auth for simple session, or mock it. Keep Firebase Auth for login.
    if (!loading && (!firebaseUser || profile?.role !== 'owner')) {
      router.push('/login?role=owner');
    }
  }, [loading, firebaseUser, profile, router]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Only show requests for this owner
        setRequests(data.filter((r: any) => r.ownerId === firebaseUser?.uid));
      }
    } catch (err) {}
  }, [firebaseUser]);

  useEffect(() => {
    if (firebaseUser && profile?.role === 'owner') {
      fetchRequests();
    }
  }, [firebaseUser, profile, fetchRequests]);

  // Mapbox mini-map
  useEffect(() => {
    if (!showMap || !mapContainerRef.current || mapInstanceRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [79.0882, 21.1458],
      zoom: 12,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapInstanceRef.current = map;

    map.on('click', (e) => {
      const { lat: cLat, lng: cLng } = e.lngLat;
      setLat(parseFloat(cLat.toFixed(6)));
      setLng(parseFloat(cLng.toFixed(6)));
      if (markerRef.current) {
        markerRef.current.setLngLat([cLng, cLat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#f59e0b' })
          .setLngLat([cLng, cLat])
          .addTo(map);
      }
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [showMap]);

  const toggleArr = (arr: string[], val: string, setter: (a: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  // Handle image selection + preview
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPropertyImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Title is required');
    if (!rentPrice || parseInt(rentPrice, 10) <= 0) errs.push('Valid rent price is required');
    if (!address.trim()) errs.push('Address is required');
    if (!area.trim()) errs.push('Area is required');
    if (lat === null || lng === null) errs.push('Location must be selected on the map');
    if (!propertyImage) errs.push('Property image is required');
    return errs;
  };

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSubmitMsg('');
      return;
    }
    setErrors([]);
    setSubmitting(true);
    setSubmitMsg('');

    try {
      // Convert image to base64
      let imageDataUrl = '';
      if (propertyImage) {
        imageDataUrl = await fileToBase64(propertyImage);
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          bhk: bhk ? parseInt(bhk, 10) : undefined,
          location: { area: area.trim(), address: address.trim(), lat: lat!, lng: lng! },
          rent_price: parseInt(rentPrice, 10),
          gender_preference: gender,
          available_from: 'Immediately',
          transport_modes: [],
          amenities: { in_unit: inUnit, shared },
          image_url: imageDataUrl,
          ownerId: firebaseUser!.uid,
          ownerName: profile!.name,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit request');

      setSubmitMsg('✅ Property submitted for admin approval!');
      // Reset
      setTitle(''); setBhk(''); setRentPrice(''); setAddress(''); setArea('');
      setInUnit([]); setShared([]);
      setLat(null); setLng(null); setPropertyImage(null); setImagePreview(null);
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
      
      // Refresh
      fetchRequests();
    } catch (err: unknown) {
      setSubmitMsg('❌ Error: ' + (err as Error).message);
    }
    setSubmitting(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, type, bhk, rentPrice, address, area, gender, inUnit, shared, lat, lng, propertyImage, firebaseUser, profile, fetchRequests]);

  if (loading) return <div className="dash-loading"><Loader2 size={28} className="spin" /> Loading…</div>;
  if (!profile || profile.role !== 'owner') return null;

  return (
    <div className="dash-page">
      <main className="dash-content owner-scroll">

        {/* Add Property Form */}
        <section className="dash-section owner-form-section">
          <h2 className="dash-section-title"><Plus size={18} /> Add New Property</h2>
          <p className="owner-form-sub">Fields marked with * are mandatory</p>

          <div className="form-grid">
            <label className="form-label">
              Title *
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunrise PG for Boys" />
            </label>
            <label className="form-label">
              Type *
              <select className="form-input" value={type} onChange={(e) => setType(e.target.value as 'PG' | 'FLAT' | 'HOUSE')}>
                <option value="PG">PG</option>
                <option value="FLAT">Flat</option>
                <option value="HOUSE">House</option>
              </select>
            </label>
            <label className="form-label">
              BHK
              <input className="form-input" type="number" value={bhk} onChange={(e) => setBhk(e.target.value)} placeholder="2" />
            </label>
            <label className="form-label">
              Monthly Rent (₹) *
              <input className="form-input" type="number" value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} placeholder="8000" />
            </label>
            <label className="form-label">
              Address *
              <input className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Plot 12, Hingna Road" />
            </label>
            <label className="form-label">
              Area *
              <input className="form-input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Hingna" />
            </label>
            <label className="form-label">
              Gender Preference
              <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="coed">Co-ed</option>
              </select>
            </label>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <p className="form-section-label">In-Unit Amenities</p>
            <div className="chip-group">
              {IN_UNIT_OPTIONS.map((a) => (
                <button key={a} className={`chip ${inUnit.includes(a) ? 'chip-active' : ''}`} onClick={() => toggleArr(inUnit, a, setInUnit)}>
                  {a.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <p className="form-section-label">Shared Amenities</p>
            <div className="chip-group">
              {SHARED_OPTIONS.map((a) => (
                <button key={a} className={`chip ${shared.includes(a) ? 'chip-active' : ''}`} onClick={() => toggleArr(shared, a, setShared)}>
                  {a.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Location Picker */}
          <div className="form-section">
            <p className="form-section-label">Property Location * <span className="form-hint">(click on map to set)</span></p>
            <button className="dash-btn owner-map-toggle" onClick={() => setShowMap(!showMap)}>
              <MapPin size={14} /> {showMap ? 'Hide Map' : 'Open Map to Select Location'}
            </button>
            {lat !== null && lng !== null && (
              <p className="form-coord">📍 {lat}, {lng}</p>
            )}
            {showMap && (
              <div ref={mapContainerRef} className="owner-map" />
            )}
          </div>

          {/* Image upload */}
          <div className="form-section">
            <p className="form-section-label">Property Image * <span className="form-hint">(will be shown on map)</span></p>
            <label className="owner-img-upload">
              <input type="file" accept="image/*" className="owner-img-input" onChange={handleImageSelect} />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="owner-img-preview" />
              ) : (
                <div className="owner-img-placeholder">
                  <ImageIcon size={24} />
                  <span>Click to upload image</span>
                </div>
              )}
            </label>
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="owner-errors">
              {errors.map((e, i) => (
                <div key={i} className="owner-error-item"><AlertCircle size={12} /> {e}</div>
              ))}
            </div>
          )}

          {submitMsg && <div className={`form-msg ${submitMsg.includes('❌') ? 'form-msg-error' : 'form-msg-success'}`}>{submitMsg}</div>}

          <button className="dash-btn dash-btn-primary owner-submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><Loader2 size={14} className="spin" /> Submitting…</> : <><Upload size={14} /> Submit for Approval</>}
          </button>
        </section>

        {/* My Requests */}
        <section className="dash-section">
          <button className="dash-section-toggle" onClick={() => setShowRequests(!showRequests)}>
            <h2 className="dash-section-title"><Clock size={18} /> My Submissions ({requests.length})</h2>
            {showRequests ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showRequests && (
            <div className="req-list">
              {requests.length === 0 && <p className="req-empty">No submissions yet. Add your first property above!</p>}
              {requests.map((r) => (
                <div key={r.reqId} className="req-card">
                  <div className="req-card-head">
                    <div className="req-card-info">
                      {r.image_url && <img src={r.image_url} alt="" className="req-thumb" />}
                      <div>
                        <span className="req-title">{r.title}</span>
                        <p className="req-meta">{r.type} · ₹{(r.rent_price || 0).toLocaleString('en-IN')}/mo · {r.location?.area}</p>
                      </div>
                    </div>
                    <span className={`req-status req-status-${r.status}`}>
                      {r.status === 'pending' && <Clock size={12} />}
                      {r.status === 'approved' && <CheckCircle size={12} />}
                      {r.status === 'denied' && <XCircle size={12} />}
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
