'use client';
import LoginWithEmail from '@/components/auth/login-with-email';
import { AuthWrapper } from '@/components/auth/ready-wrapper';
import Image from 'next/image';

export default function Home() {
  return (
    <main>
      <AuthWrapper />
    </main>
  );
}
