"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative w-full min-h-screen overflow-hidden">
      {/* Full-screen Video Background */}
      <video
        className="absolute inset-0 h-full w-full object-cover z-0"
        src="/zoom in.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />
      
      {/* Optional: Simple Loader or Message */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      </div>
    </main>
  );
}
