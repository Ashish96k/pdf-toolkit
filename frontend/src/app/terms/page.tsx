import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for PDF Toolkit: free service, no warranty, and acceptable use.",
  alternates: { canonical: `${getSiteUrl()}/terms` },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Last updated: March 29, 2026
        </p>
      </header>

      <article className="space-y-8 text-[15px] leading-relaxed text-text-secondary">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Agreement</h2>
          <p>
            By using PDF Toolkit (“the Service”), you agree to these Terms of
            Use. If you do not agree, please do not use the site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Free service</h2>
          <p>
            The Service is offered free of charge for personal and commercial
            use as described on the site. We may change, limit, or discontinue
            features without notice; we will try to avoid disruption where
            possible.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            No warranty on conversion quality
          </h2>
          <p>
            PDF processing, compression, and conversion (including PDF to
            Word) depend on the source file, fonts, encoding, and other factors.
            The Service is provided “as is” without warranties of any kind,
            express or implied. We do not guarantee that output will be
            error-free, pixel-perfect, or suitable for any particular purpose.
            You are responsible for reviewing results before relying on them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Confidential and sensitive documents
          </h2>
          <p>
            Do not upload documents that contain highly confidential, regulated,
            or legally protected information (for example, certain health,
            financial, or government-controlled data) unless you have assessed the
            risks and applicable laws. You are solely responsible for the
            content you upload and for complying with your organization’s
            policies and legal obligations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Acceptable use</h2>
          <p>
            You must not use the Service to upload unlawful content, malware, or
            material that infringes others’ rights. You must not attempt to
            disrupt the Service, probe for vulnerabilities beyond what is
            permitted by law, or abuse rate limits or infrastructure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, we are not liable for any
            indirect, incidental, special, or consequential damages arising from
            your use of the Service, including loss of data, profits, or
            business opportunity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Changes</h2>
          <p>
            We may update these Terms from time to time. The “Last updated” date
            at the top will reflect when changes were posted. Continued use after
            changes constitutes acceptance of the updated Terms.
          </p>
        </section>
      </article>
    </div>
  );
}
