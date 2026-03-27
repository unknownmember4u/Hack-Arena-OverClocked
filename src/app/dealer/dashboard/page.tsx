"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Image from "next/image";
import { ContactCard } from "@/components/ui/contact-card";
import VerificationForm from "@/components/dealer/verification-form";
import { ShieldCheck, Clock, BadgeCheck } from "lucide-react";

export default function DealerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/");
      } else {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data().role !== "dealer") {
            router.replace("/dashboard");
          } else if (!userDoc.exists()) {
            router.replace("/dashboard");
          } else {
            setUser(currentUser);
          }
        } catch (fsError) {
          console.warn("Dealer Dashboard Firestore error:", fsError);
          router.replace("/dashboard");
        }
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
      {/* ── Premium Glassmorphism Header ── */}
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
        <div className="flex items-center gap-5">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest hidden sm:block">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="px-5 py-2 rounded-xl bg-black text-white hover:bg-black/80 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-black/10"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Content: ContactCard with Verification Form ── */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 pt-32 pb-16">
        <div className="w-full max-w-6xl">
          <ContactCard
            title="Dealer Verification"
            description="Complete your profile to get verified as a YatraSathi dealer. All fields are required. Our team will review your submission within 1–2 business days."
            contactInfo={[
              {
                icon: ShieldCheck,
                label: "Secure",
                value: "Your data is encrypted & safe",
              },
              {
                icon: Clock,
                label: "Quick Review",
                value: "1–2 business days turnaround",
              },
              {
                icon: BadgeCheck,
                label: "Get Verified",
                value: "Unlock full dealer access",
                className: "md:col-span-2 lg:col-span-1",
              },
            ]}
            formSectionClassName="items-start overflow-y-auto max-h-[80vh]"
          >
            <VerificationForm />
          </ContactCard>
        </div>
      </main>

      {/* Subtle Background Blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/20 rounded-full blur-[120px] -z-10" />
    </div>
  );
}
