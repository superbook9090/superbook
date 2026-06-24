'use client';

import {
  LazyHomeAbout,
  LazyHomeFeatures,
  LazyHomeFooter,
  LazyHomeHowItWorks,
  LazyHomeRoles,
} from '@/lib/lazy/home';
import FeaturedBlogs from '@/components/home/FeaturedBlogs';
import SeoResources from '@/components/home/SeoResources';

export default function HomeBelowFold() {
  return (
    <>
      <div className="landing-section-defer">
        <LazyHomeHowItWorks />
      </div>
      <div className="landing-section-defer">
        <LazyHomeFeatures />
      </div>
      <SeoResources />
      <FeaturedBlogs />
      <div className="landing-section-defer">
        <LazyHomeRoles />
      </div>
      <div className="landing-section-defer">
        <LazyHomeAbout />
      </div>
      <LazyHomeFooter />
    </>
  );
}
