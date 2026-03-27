"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Image from "next/image";
import { CheckCircle2, XCircle, Clock, User as UserIcon, Phone, MapPin, Briefcase } from "lucide-react";

const ADMIN_EMAIL = "unknownmember4u@gmail.com";

interface DealerRequest {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  age: string;
  gender: string;
  occupation: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  status: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DealerRequest[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/");
      } else if (currentUser.email !== ADMIN_EMAIL) {
        router.replace("/");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Real-time listener for pending dealer requests
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "dealer_requests"),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs: DealerRequest[] = [];
      snapshot.forEach((docSnap) => {
        reqs.push({ id: docSnap.id, ...docSnap.data() } as DealerRequest);
      });
      // Sort by createdAt descending
      reqs.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setRequests(reqs);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAction = async (requestId: string, action: "approved" | "denied") => {
    setActionLoading(requestId);
    try {
      await updateDoc(doc(db, "dealer_requests", requestId), {
        status: action,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating request:", err);
      alert("Failed to update. Try again.");
    }
    setActionLoading(null);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-black/10 border-t-black/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#1a1a1a] font-sans">
      {/* ── Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex justify-between items-center"
        style={{
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="YatraSathi Logo" width={300} height={80} className="object-contain h-16 w-auto" priority />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">Admin Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest hidden sm:block">{user?.email}</span>
          <button onClick={handleSignOut} className="px-5 py-2 rounded-xl bg-black text-white hover:bg-black/80 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-black/10">
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-32 pb-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Dealer Verification Requests</h1>
          <p className="text-black/40 text-sm mt-2">
            Review and approve or deny dealer verification requests in real-time.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200/60">
              <Clock className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-black/30 font-semibold">No pending requests</p>
            <p className="text-black/20 text-sm">New dealer requests will appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl p-6 sm:p-8 transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.04)",
                }}
              >
                {/* Request Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">{req.fullName}</h3>
                    <p className="text-xs text-black/40 mt-0.5">{req.email}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Pending
                  </div>
                </div>

                {/* Request Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <InfoItem icon={<UserIcon className="h-3.5 w-3.5" />} label="Age" value={`${req.age} yrs, ${req.gender}`} />
                  <InfoItem icon={<Briefcase className="h-3.5 w-3.5" />} label="Occupation" value={req.occupation} />
                  <InfoItem icon={<Phone className="h-3.5 w-3.5" />} label="Mobile" value={req.mobile} />
                  <InfoItem icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={`${req.city}, ${req.state} - ${req.pincode}`} />
                </div>

                {/* Address */}
                <div className="mb-6 p-3 rounded-xl bg-black/[0.02] border border-black/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1">Address</p>
                  <p className="text-sm text-black/60">{req.address}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(req.id, "approved")}
                    disabled={actionLoading === req.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "denied")}
                    disabled={actionLoading === req.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
                  >
                    <XCircle className="h-4 w-4" />
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/20 rounded-full blur-[120px] -z-10" />
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/30">
        {icon} {label}
      </div>
      <p className="text-sm font-medium text-black/70">{value}</p>
    </div>
  );
}
