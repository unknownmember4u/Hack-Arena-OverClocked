'use client';

/**
 * Global Navbar — role-based navigation with sign-out.
 */

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  Home, Map, Shield, Building, LogIn, LogOut, Menu, X, User,
} from 'lucide-react';
import { useState } from 'react';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[]; // show only for these roles; undefined = show always
  authRequired?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Map Explorer', icon: <Map size={15} />, authRequired: true },
  { href: '/owner-dashboard', label: 'Owner Panel', icon: <Building size={15} />, roles: ['owner'] },
  { href: '/admin-dashboard', label: 'Admin Panel', icon: <Shield size={15} />, roles: ['admin'] },
  { href: '/about', label: 'About', icon: <Home size={15} /> },
];

export default function Navbar() {
  const { firebaseUser, profile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't render on login/landing/seed pages
  if (['/login', '/landing', '/seed'].includes(pathname)) return null;

  const role = profile?.role;
  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.authRequired && !firebaseUser) return false;
    if (link.roles && (!role || !link.roles.includes(role))) return false;
    return true;
  });

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <nav className="global-nav">
      <div className="nav-inner">
        {/* Brand */}
        <button className="nav-brand" onClick={() => router.push('/')}>
          <Home size={18} className="nav-brand-icon" />
          <span className="nav-brand-text">Yatra Sathi</span>
        </button>

        {/* Desktop links */}
        <div className="nav-links">
          {visibleLinks.map((link) => (
            <button
              key={link.href}
              className={`nav-link ${pathname === link.href ? 'nav-link-active' : ''}`}
              onClick={() => router.push(link.href)}
            >
              {link.icon} {link.label}
            </button>
          ))}
        </div>

        {/* Right section */}
        <div className="nav-right">
          {!loading && firebaseUser ? (
            <>
              <span className="nav-user">
                <User size={13} />
                {profile?.name || firebaseUser.email?.split('@')[0]}
                {role && <span className="nav-role-badge">{role}</span>}
              </span>
              <button className="nav-signout" onClick={handleSignOut}>
                <LogOut size={13} /> Sign Out
              </button>
            </>
          ) : (
            !loading && (
              <button className="nav-link" onClick={() => router.push('/login')}>
                <LogIn size={15} /> Login
              </button>
            )
          )}

          {/* Mobile hamburger */}
          <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="nav-mobile">
          {visibleLinks.map((link) => (
            <button
              key={link.href}
              className={`nav-mobile-link ${pathname === link.href ? 'nav-link-active' : ''}`}
              onClick={() => { router.push(link.href); setMobileOpen(false); }}
            >
              {link.icon} {link.label}
            </button>
          ))}
          {firebaseUser && (
            <button className="nav-mobile-link nav-signout-mobile" onClick={handleSignOut}>
              <LogOut size={14} /> Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
