'use client';

import { useRouter } from 'next/navigation';
import { Home, Search, Building } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <Home size={48} className="landing-logo" />
        <h1 className="landing-title">Yatra Sathi</h1>
        <p className="landing-sub">Find commute-friendly properties in Nagpur, India</p>
        <div className="landing-ctas">
          <button className="landing-btn landing-btn-primary" onClick={() => router.push('/login')}>
            <Search size={18} /> Find a Home
          </button>
          <button className="landing-btn landing-btn-secondary" onClick={() => router.push('/login?role=owner')}>
            <Building size={18} /> List Property
          </button>
        </div>
      </div>
    </div>
  );
}
