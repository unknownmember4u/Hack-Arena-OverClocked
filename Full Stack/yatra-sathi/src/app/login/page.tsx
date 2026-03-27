'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/lib/firestoreService';
import { Home, LogIn, UserPlus, Mail, Lock, User, Calendar, Briefcase } from 'lucide-react';

type Tab = 'signin' | 'register';
type Role = 'user' | 'owner' | 'admin';

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('role') as Role) || 'user';

  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState<Role>(defaultRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (r: Role) => {
    if (r === 'owner') router.push('/owner-dashboard');
    else if (r === 'admin') router.push('/admin-dashboard');
    else router.push('/');
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const { getUserProfile } = await import('@/lib/firestoreService');
      const user = auth.currentUser;
      if (user) {
        const profile = await getUserProfile(user.uid);
        redirectByRole(profile?.role ?? 'user');
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !age || !email || !password) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(cred.user.uid, {
        name,
        age: parseInt(age, 10),
        email,
        role,
      });
      redirectByRole(role);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <Home size={28} className="login-logo-icon" />
          <h1>Yatra Sathi</h1>
          <p className="login-sub">Commute-Centric Real Estate</p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button className={`login-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => setTab('signin')}>
            <LogIn size={14} /> Sign In
          </button>
          <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            <UserPlus size={14} /> Register
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        {/* Sign In */}
        {tab === 'signin' && (
          <div className="login-form">
            <label className="login-field">
              <Mail size={14} />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="login-field">
              <Lock size={14} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button className="login-submit" onClick={handleSignIn} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        )}

        {/* Register */}
        {tab === 'register' && (
          <div className="login-form">
            <label className="login-field">
              <User size={14} />
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="login-field">
              <Calendar size={14} />
              <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            </label>
            <label className="login-field">
              <Mail size={14} />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="login-field">
              <Lock size={14} />
              <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="login-field">
              <Briefcase size={14} />
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="user">Home Seeker</option>
                <option value="owner">Property Owner</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="login-submit" onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="dash-loading">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
