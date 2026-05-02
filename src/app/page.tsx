'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/home/Header';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Roles from '@/components/home/Roles';
import About from '@/components/home/About';
import Footer from '@/components/home/Footer';
import { useSessionStore } from '@/store/useSessionStore';

export default function HomePage() {
  const { status } = useSessionStore();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <section id="features">
        <Features />
      </section>
      <section id="roles">
        <Roles />
      </section>
      <section id="about">
        <About />
      </section>
      <Footer />
    </main>
  );
}
