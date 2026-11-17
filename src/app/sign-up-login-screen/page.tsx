import { Suspense } from 'react';
import AuthClient from './components/AuthClient';

export default function SignUpLoginScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-[#D4AF37]">Loading...</div>}>
      <AuthClient />
    </Suspense>
  );
}

