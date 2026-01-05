import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const lastUpdated = "January 5, 2026";

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground text-gray-500">Last Updated: {lastUpdated}</p>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
            <p>
              Welcome to Twitify ("we," "our," or "us"), operated by <strong>Twitify By Bill</strong>. 
              We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our web application located at 
              twitify.tech and our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
            <h3 className="text-lg font-medium mt-4 text-gray-800">2.1 Information from X (Twitter)</h3>
            <p>
              Twitify uses X (Twitter) OAuth 2.0 to authenticate users and provide its core services. 
              When you connect your X account, we may collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your X username and display name.</li>
              <li>Your profile picture and profile description.</li>
              <li>Your account ID.</li>
              <li>Your email address associated with your X account (with your explicit permission).</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 text-gray-800">2.2 Usage Data</h3>
            <p>
              We collect information about your interactions with our service, such as the content you generate, 
              scheduling preferences, and analytics data related to your tweets.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. How We Use Your Information</h2>
            <p>We use the collected data to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide, operate, and maintain Twitify.</li>
              <li>Generate AI-powered content suggestions based on your profile and preferences.</li>
              <li>Schedule and publish tweets to your X account on your behalf.</li>
              <li>Process payments and manage subscriptions via Stripe.</li>
              <li>Communicate with you regarding your account and support requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Third-Party Services</h2>
            <p>We share data with the following third-party processors to provide our services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Supabase:</strong> For database hosting and authentication services.</li>
              <li><strong>X (Twitter):</strong> To read profile data and post tweets.</li>
              <li><strong>OpenAI & Anthropic:</strong> To generate AI content suggestions (your personal identity is not shared with these providers).</li>
              <li><strong>Stripe:</strong> To securely process payment information. We do not store your credit card details on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Data Retention and Deletion</h2>
            <p>
              We retain your information as long as your account is active. You can request the deletion of your 
              account and all associated data at any time by contacting us at <strong>support@twitify.tech</strong>.
            </p>
            <p className="mt-2">
              You can also revoke Twitify's access to your X account at any time through your 
              X account's security settings (Apps and Sessions).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. However, no method of 
              transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2 font-medium">
              Email: support@twitify.tech<br />
              Operator: Bill (Twitify By Bill)
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

