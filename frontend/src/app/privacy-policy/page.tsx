import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PDF Toolkit handles your files and data, including analytics and cookies.",
  alternates: { canonical: `${getSiteUrl()}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Last updated: March 29, 2026
        </p>
      </header>

      <article className="space-y-8 text-[15px] leading-relaxed text-text-secondary">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Overview</h2>
          <p>
            PDF Toolkit (“we”, “us”) provides free online PDF tools. This
            policy explains what information is collected when you use the site,
            how uploaded files are handled, and how we use cookies and
            analytics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Information we collect
          </h2>
          <p>
            We may collect non-personal usage data through Google Analytics 4
            (GA4), such as pages viewed, approximate location (region), device
            and browser type, and interactions with the site (for example, which
            tools were used). This helps us understand how the service is used
            and improve performance and content.
          </p>
          <p>
            We do not use Google Analytics to identify you personally, and we do
            not ask you to create an account for basic use of the tools.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Uploaded files and processing
          </h2>
          <p>
            When you use tools that process files on our servers (for example,
            merge, split, compress, or PDF to Word), your files are transmitted
            to our systems only for the duration needed to complete the
            operation. Files are automatically deleted after a short retention
            period (typically within one hour of upload or processing). We do not
            use your documents for training, resale, or marketing.
          </p>
          <p>
            Tools that run entirely in your browser (such as the PDF editor when
            no server upload is involved) do not send your file content to our
            servers for that operation unless you use a server-backed feature.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Personal data and storage
          </h2>
          <p>
            We do not maintain a user database for anonymous visitors. We do not
            store names, email addresses, or passwords for basic tool usage. If
            you contact us by email in the future, we would use that information
            only to respond to your request.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Cookies and advertising
          </h2>
          <p>
            We may use cookies and similar technologies for analytics (GA4) to
            remember preferences and measure traffic. If we display
            Google-served ads (AdSense), Google may use cookies to show
            relevant ads and limit how often you see an ad. You can manage
            cookie preferences in your browser and learn more about Google’s
            practices in Google’s Privacy & Terms documentation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Changes to this policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. The “Last
            updated” date at the top will change when we do. Continued use of
            the site after changes means you accept the revised policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p>
            For privacy-related questions, please use the contact method
            provided on the site when available.
          </p>
        </section>
      </article>
    </div>
  );
}
