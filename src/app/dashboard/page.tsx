"use client";

import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import Image from "next/image";

export default function DashboardPage() {
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
          <p className="text-lg text-white/70 mb-6 leading-relaxed">
            YatraSathi is your intelligent travel companion. Plan, explore, and experience
            unforgettable destinations across India — all in one place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { label: "Trips Planned", value: "—", icon: "🗺️" },
              { label: "Places Saved", value: "—", icon: "📍" },
              { label: "Memories Made", value: "—", icon: "📸" },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col gap-2 hover:border-white/20 hover:bg-white/10 transition-all duration-200"
              >
                <span className="text-2xl">{card.icon}</span>
                <span className="text-3xl font-bold text-white/40">{card.value}</span>
                <span className="text-sm text-white/50">{card.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            More features coming soon — stay tuned!
          </div>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
