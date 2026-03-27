"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [phase, setPhase] = useState<"video" | "fadeOut" | "getStarted">("video");

  useEffect(() => {
    // After 3s, fade out video
    const t1 = setTimeout(() => setPhase("fadeOut"), 3000);
    // After fade (0.8s), show Get Started page
    const t2 = setTimeout(() => setPhase("getStarted"), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#050510",
        position: "relative",
      }}
    >
      {/* ── Phase 1 & 2: Background Video ── */}
      {phase !== "getStarted" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            opacity: phase === "fadeOut" ? 0 : 1,
            transition: "opacity 0.8s ease",
          }}
        >
          <video
            autoPlay
            muted
            playsInline
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              minWidth: "100%",
              minHeight: "100%",
              transform: "translate(-50%, -50%)",
              objectFit: "cover",
            }}
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>

          {/* Subtle overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
            }}
          />

          {/* Centered logo during video */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: "300px", opacity: 0.9 }}
            />
          </div>
        </div>
      )}

      {/* ── Phase 3: Get Started Page ── */}
      {phase === "getStarted" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
            animation: "fadeInUp 0.8s ease forwards",
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />

          <img
            src="/logo.png"
            alt="YatraSathi"
            style={{
              width: "280px",
              marginBottom: "24px",
              position: "relative",
              zIndex: 1,
            }}
          />

          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "1.15rem",
              fontWeight: 300,
              letterSpacing: "0.04em",
              marginBottom: "48px",
              maxWidth: "400px",
              lineHeight: 1.6,
              position: "relative",
              zIndex: 1,
            }}
          >
            Your intelligent travel companion — plan, explore, and experience
            India.
          </p>

          <a
            href="http://localhost:3000"
            style={{
              padding: "16px 60px",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              border: "none",
              borderRadius: "50px",
              textDecoration: "none",
              letterSpacing: "0.03em",
              boxShadow: "0 0 40px rgba(124, 58, 237, 0.35)",
              transition: "all 0.3s ease",
              position: "relative",
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 0 60px rgba(124, 58, 237, 0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 0 40px rgba(124, 58, 237, 0.35)";
            }}
          >
            Get Started
          </a>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
