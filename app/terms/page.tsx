import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  const lastUpdated = "January 5, 2026";

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground text-gray-500">Last Updated: {lastUpdated}</p>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Agreement to Terms</h2>
            <p>
              By accessing or using Twitify ("the Service"), operated by <strong>Twitify By Bill</strong>, 
              you agree to be bound by these Terms of Service. If you do not agree to these terms, 
              please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Use of Service</h2>
            <p>
              Twitify is an AI-powered X (Twitter) management tool. You must be at least 18 years old 
              to use this Service. You are responsible for maintaining the confidentiality of your 
              account and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. X (Twitter) Integration</h2>
            <p>
              Twitify interacts with your X account via the X API. By using the Service, you also 
              agree to abide by X's Terms of Service and Developer Agreement. We are not responsible 
              for any actions taken by X against your account, including suspension or termination, 
              resulting from your use of Twitify.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. AI Content Generation</h2>
            <p>
              Twitify uses artificial intelligence (OpenAI/Anthropic) to generate content suggestions. 
              While we strive for high-quality output, we do not guarantee the accuracy, 
              appropriateness, or legality of the generated content. You are solely responsible 
              for reviewing and approving all content before it is published to your X account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Subscriptions and Payments</h2>
            <p>
              Certain features of the Service require a paid subscription. All payments are processed 
              securely via Stripe. Subscriptions automatically renew unless cancelled. You can 
              manage or cancel your subscription at any time through the billing portal in your dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Limitation of Liability</h2>
            <p>
              In no event shall Twitify By Bill be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including without limitation, loss of profits, 
              data, or account access, arising out of or in connection with your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify you of any 
              significant changes by posting the new terms on this page. Your continued use of the 
              Service after such changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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

