import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Space Saver',
  description: 'Privacy Policy for the Space Saver application.',
};

export default function SpaceSaverPrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: August 23, 2026</p>

          <p>
            Welcome to Space Saver ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p>
            Space Saver is designed to help you manage your device storage efficiently. To provide this service, the application may require access to certain files and storage on your device.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2"><strong>Device Storage:</strong> We require read and write permissions to analyze your storage usage and help you identify files you may want to delete or compress.</li>
            <li className="mb-2"><strong>Media Files:</strong> If you use features related to media optimization, we will need access to your photos and videos locally on your device.</li>
          </ul>
          <p>
            <strong>Crucially, all file processing happens locally on your device.</strong> We do not upload your personal files, photos, or documents to our servers.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            The access we request is used strictly for the core functionality of the Space Saver app:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">To calculate available storage space.</li>
            <li className="mb-2">To identify large, duplicate, or unnecessary files.</li>
            <li className="mb-2">To perform file compression or deletion upon your explicit request.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. Data Sharing and Disclosure</h2>
          <p>
            Because we do not collect or transmit your personal files or usage data to our servers, we do not share, sell, rent, or trade your personal information with third parties.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Third-Party Services</h2>
          <p>
            The app may use third-party services (such as crash reporting or analytics) to help us improve the app. These services may collect anonymous, aggregated data about how you use the app, such as device type, OS version, and crash logs. These services do not have access to your personal files.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Children's Privacy</h2>
          <p>
            Our application is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Contact Us</h2>
          <p>
            If you have questions or comments about this notice, you may email us at:
            <br />
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@example.com</a>
          </p>
        </div>
      </div>
    </main>
  );
}
