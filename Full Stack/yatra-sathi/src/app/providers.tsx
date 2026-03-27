'use client';
import { AuthProvider } from '@/lib/authContext';
import Navbar from '@/components/Navbar';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
    </AuthProvider>
  );
}
