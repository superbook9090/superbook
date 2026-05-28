'use client';

import Header from '@/components/home/Header';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import Features from '@/components/home/Features';
import Roles from '@/components/home/Roles';
import About from '@/components/home/About';
import Footer from '@/components/home/Footer';

export default function HomePageClient() {
  return (
    <>
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <Roles />
      <About />
      <Footer />
    </>
  );
}
