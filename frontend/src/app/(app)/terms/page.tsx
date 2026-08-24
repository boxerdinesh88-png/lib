import { Scale } from "lucide-react";

import { LegalList, LegalPage, LegalSection } from "@/components/layout/legal-page";

export const metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of the Phahendra Babu Library seat-booking service.",
};

export default function TermsPage() {
  return (
    <LegalPage
      icon={Scale}
      badge="Terms of Service"
      title="Terms of Service"
      subtitle="The terms that govern your use of the Phahendra Babu Library seat-booking service."
      updated="11 August 2026"
    >
      <LegalSection title="1. Acceptance of terms">
        <p>
          By creating an account, booking a seat, or using any part of the
          phagendrababulibrary.in website and its services, you agree to be bound by these Terms of
          Service. If you do not agree, please do not use the service.
        </p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>
          Phahendra Babu Library (&quot;the Library&quot;, &quot;we&quot;, &quot;us&quot;) provides a
          study-library seat booking service. Members reserve a dedicated seat for a selected time
          block on a monthly basis and pay the applicable monthly fee. The service is managed by
          Akash Kumar on behalf of the Library.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility & account">
        <p>To use the service you must:</p>
        <LegalList
          items={[
            "Provide accurate and complete information during registration, including a valid name, mobile number, email address and a recent profile photo.",
            "Submit a valid identity document (e.g. Aadhaar card) for verification purposes.",
            "Keep your login credentials secure and not share your account with others.",
            "Be at least 18 years of age, or have the consent of a parent or guardian if under 18.",
          ]}
        />
        <p>
          You are responsible for all activity that occurs under your account. We may suspend or
          terminate accounts that violate these terms.
        </p>
      </LegalSection>

      <LegalSection title="4. Bookings & payments">
        <p>
          Bookings are confirmed only after payment is received, or after a cash booking is approved
          by the Library. Fees are charged per month for the selected time block and are shown on the
          Membership page before checkout. Prices may be revised from time to time; the price
          confirmed at the time of your booking applies to that booking.
        </p>
      </LegalSection>

      <LegalSection title="5. Seat availability & conduct">
        <LegalList
          items={[
            "Seats are allocated on a first-come, first-served basis and are subject to availability.",
            "Your seat is reserved for the duration of your paid membership and time block.",
            "You must use the library premises respectfully and follow all rules displayed at the library.",
            "The Library may reassign or relocate a seat in exceptional circumstances, such as maintenance or safety requirements.",
            "Any disruptive, offensive or unlawful behaviour may result in cancellation of your booking without refund.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Cancellation & refunds">
        <p>
          Refunds are governed by our separate Refund Policy, which is available on the website and
          forms part of these terms. Refund requests must be submitted to the Library by phone or
          email within the timelines described in that policy.
        </p>
      </LegalSection>

      <LegalSection title="7. Acceptable use">
        <LegalList
          items={[
            "Do not attempt to disrupt, overload, or misuse the website or its services.",
            "Do not scrape, reverse engineer, or copy the website's content or software without permission.",
            "Do not use the service for any unlawful purpose.",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          To the maximum extent permitted by law, the Library is not liable for indirect, incidental
          or consequential losses arising from your use of the service, including lost study time,
          lost profits or interruption of service. Our total liability for any claim is limited to
          the amount you paid for the affected booking.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to these terms">
        <p>
          We may update these terms from time to time. The latest version will always be available on
          this page with its last-updated date. Continued use of the service after changes means you
          accept the revised terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these terms can be directed to PhahendraBabulibrary@gmail.com or
          +91 8804162854, or in person at Vill- Kharhat, P.O.- Phulmallik, P.S.- Sahebpur Kamal,
          Dist.- Begusarai, Bihar 851217.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
