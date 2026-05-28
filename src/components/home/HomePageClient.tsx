'use client';

import Header from '@/components/home/Header';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import Roles from '@/components/home/Roles';
import { LazyAbout, LazyFooter } from '@/lib/lazy/marketing';

export default function HomePageClient() {
  return (
    <>
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <Roles />
      <LazyAbout />
      <LazyFooter />
    </>
  );
}
