"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";

export default function DealerPortal() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

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
    <div className="min-h-screen bg-[#fcfaf7] text-[#1a1a1a] flex flex-col font-sans">
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
        <Image src="/logo.png" alt="YatraSathi Logo" width={300} height={80} className="object-contain h-20 w-auto" priority />
        <div className="flex items-center gap-5">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest hidden sm:block">{user?.email}</span>
          <button onClick={handleSignOut} className="px-5 py-2 rounded-xl bg-black text-white hover:bg-black/80 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-black/10">
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Blank Portal Page ── */}
      <main className="flex-1 flex items-center justify-center pt-32 pb-16">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to the Dealer Portal</h1>
          <p className="text-black/40 text-sm">Your verification has been approved. This page is under construction.</p>
        </div>
      </main>
    </div>
  );
}
