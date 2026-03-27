"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import Image from "next/image";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Bypassing mandatory login for now as requested
      if (currentUser) {
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  const avatarUrl = !imgError && user?.photoURL ? user.photoURL : null;
  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="relative min-h-screen text-white">

      {/* ── Glassmorphism Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="YatraSathi Logo"
            width={240}
            height={72}
            className="object-contain h-16 w-auto"
            priority
          />
        </div>

        {/* Right: email + avatar + sign out */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50 hidden sm:block max-w-[180px] truncate">
            {user?.email}
          </span>

          {/* Profile picture or initials */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/20 flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                }}
              >
                {initials}
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="text-sm px-4 py-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Scroll Expansion Hero */}
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="/nagpur.mp4"
        bgVideoSrc="/bg.mp4"
        title="Explore Nagpur City"
        date="YatraSathi"
        scrollToExpand="Scroll to explore ↓"
        textBlend
      >
        <div className="max-w-4xl mx-auto text-white">
          <h2 className="text-3xl font-bold mb-6 text-white">Discover Your Next Journey</h2>
          <p className="text-lg text-white/70 mb-8 leading-relaxed">
            YatraSathi is your intelligent travel companion. Plan, explore, and experience
            unforgettable destinations across India — all in one place.
          </p>

          <button
            onClick={() => window.location.href = "http://localhost:3000"}
            className="px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Get Started
          </button>

        </div>
      </ScrollExpandMedia>
    </div>
  );
}
