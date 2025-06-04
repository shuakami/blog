import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - Luoxiaohei',
  description: 'Privacy policy for Luoxiaohei\'s blog'
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-3xl mb-16 font-medium text-black dark:text-white">
          Privacy Policy
        </h1>

        <div className="prose dark:prose-invert">
          <p>
            This privacy policy outlines how we collect, use, and protect your information when you visit this website.
          </p>

          <h2>Information Collection</h2>
          <p>
            We do not collect any personal information unless explicitly provided by you. The only information we automatically collect is:
          </p>
          <ul>
            <li>Access logs (IP addresses, browser information)</li>
            <li>Performance metrics</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use essential cookies to:
          </p>
          <ul>
            <li>Remember your theme preference (light/dark mode)</li>
            <li>Improve site performance</li>
          </ul>

          <h2>Third-party Services</h2>
          <p>
            This site may use third-party services for:
          </p>
          <ul>
            <li>Analytics (to understand site usage)</li>
            <li>Content delivery (to serve images and assets)</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We take reasonable measures to protect any information collected. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2>Updates to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this page.
          </p>

          <h2>Contact</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at{' '}
            <a
              href="mailto:your@email.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              your@email.com
            </a>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
} 