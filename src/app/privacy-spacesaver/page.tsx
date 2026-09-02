import type { Metadata } from 'next';
import React from 'react';
import { Shield, HardDrive, Lock, EyeOff, Server, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Space Saver',
  description: 'Privacy Policy for the Space Saver application.',
};

export default function SpaceSaverPrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 text-[var(--color-foreground)]">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--primary)]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--primary-accent)]/10 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--card-solid)] rounded-2xl shadow-xl border border-[var(--border)] mb-6">
            <Shield className="w-12 h-12 text-[var(--primary)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-foreground)] mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            Welcome to Space Saver. We believe in complete transparency and are committed to protecting your personal information and right to privacy.
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-sm font-medium border border-[var(--primary-border)]">
            Last updated: August 23, 2026
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-8">
          <PolicyCard
            icon={<HardDrive className="w-6 h-6 text-[var(--primary)]" />}
            title="1. Information We Collect"
          >
            <p className="text-[var(--color-muted-foreground)] mb-4">
              Space Saver is designed to help you manage your device storage efficiently. To provide this service, the application may require access to certain files and storage on your device.
            </p>
            <ul className="space-y-3">
              <ListItem><strong>Device Storage:</strong> We require read and write permissions to analyze your storage usage and help you identify files you may want to delete or compress.</ListItem>
              <ListItem><strong>Media Files:</strong> If you use features related to media optimization, we will need access to your photos and videos locally on your device.</ListItem>
            </ul>
            <div className="mt-6 p-4 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary-border)] flex items-start gap-3">
              <Lock className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-foreground)] font-medium">
                Crucially, all file processing happens locally on your device. We do not upload your personal files, photos, or documents to our servers.
              </p>
            </div>
          </PolicyCard>

          <PolicyCard
            icon={<EyeOff className="w-6 h-6 text-[var(--teacher-accent)]" />}
            title="2. How We Use Your Information"
          >
            <p className="text-[var(--color-muted-foreground)] mb-4">
              The access we request is used strictly for the core functionality of the Space Saver app:
            </p>
            <ul className="space-y-3">
              <ListItem>To calculate available storage space.</ListItem>
              <ListItem>To identify large, duplicate, or unnecessary files.</ListItem>
              <ListItem>To perform file compression or deletion upon your explicit request.</ListItem>
            </ul>
          </PolicyCard>

          <PolicyCard
            icon={<Server className="w-6 h-6 text-[var(--color-success)]" />}
            title="3. Data Sharing & Third-Party Services"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">Data Sharing</h3>
                <p className="text-[var(--color-muted-foreground)]">
                  Because we do not collect or transmit your personal files or usage data to our servers, we do not share, sell, rent, or trade your personal information with third parties.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">Third-Party Services</h3>
                <p className="text-[var(--color-muted-foreground)]">
                  The app may use third-party services (such as crash reporting or analytics) to help us improve the app. These services may collect anonymous, aggregated data about how you use the app, such as device type, OS version, and crash logs. These services do not have access to your personal files.
                </p>
              </div>
            </div>
          </PolicyCard>

          <PolicyCard
            icon={<Mail className="w-6 h-6 text-[var(--color-warning)]" />}
            title="4. Additional Information"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">Children&apos;s Privacy</h3>
                <p className="text-[var(--color-muted-foreground)]">
                  Our application is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">Policy Changes</h3>
                <p className="text-[var(--color-muted-foreground)]">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </div>
              <div className="pt-4 border-t border-[var(--border)]">
                <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-2">Contact Us</h3>
                <p className="text-[var(--color-muted-foreground)] mb-2">
                  If you have questions or comments about this notice, you may email us at:
                </p>
                <a href="mailto:quizdo9090@gmail.com" className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline font-medium transition-colors">
                  <Mail className="w-4 h-4" />
                  quizdo9090@gmail.com
                </a>
              </div>
            </div>
          </PolicyCard>
        </div>
      </div>
    </main>
  );
}

function PolicyCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-solid)] backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-[var(--border)] hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-[var(--color-surface-muted)] rounded-2xl">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">{title}</h2>
      </div>
      <div className="text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[var(--color-muted-foreground)]">
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2.5 shrink-0" />
      <div>{children}</div>
    </li>
  );
}
