"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import { CheckCircle2, Clock } from "lucide-react";

export default function DealerVerifiedPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string | null; displayName: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/");
        return;
      }
      setUser({
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-black/10 border-t-black/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#1a1a1a] flex flex-col font-sans">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex justify-between items-center transition-all duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="YatraSathi Logo"
            width={300}
            height={80}
            className="object-contain h-20 w-auto"
            priority
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest hidden lg:block">
            {user?.email}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-16">
        <div
          className="max-w-lg w-full rounded-[2rem] p-12 text-center space-y-6"
          style={{
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Verification Submitted
          </h1>
          <p className="text-black/50 leading-relaxed">
            Thank you{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!
            Your dealer verification request has been submitted successfully.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200/60 text-xs font-bold uppercase tracking-widest text-amber-700">
            <Clock className="h-3.5 w-3.5" />
            Under Review
          </div>

          <p className="text-[11px] text-black/30 pt-2">
            Our team will review your details within 1–2 business days.<br />
            You&apos;ll receive an email confirmation at <span className="font-semibold">{user?.email}</span>.
          </p>
        </div>
      </main>

      {/* Subtle Background Blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/15 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/15 rounded-full blur-[120px] -z-10" />
    </div>
  );
}
