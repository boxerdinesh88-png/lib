import { RotateCcw } from "lucide-react";

import { LegalList, LegalPage, LegalSection } from "@/components/layout/legal-page";

export const metadata = {
  title: "Refund Policy",
  description: "When and how you can get a refund for a Phahendra Babu Library booking.",
};

export default function RefundPage() {
  return (
    <LegalPage
      icon={RotateCcw}
      badge="Refund Policy"
      title="Refund Policy"
      subtitle="When and how you can get your money back for a Phahendra Babu Library booking."
      updated="11 August 2026"
    >
      <LegalSection title="1. Our promise">
        <p>
          We want every member to be satisfied with their seat booking. If your membership cannot be
          honoured for reasons within our control, we will make it right — either by rescheduling
          your booking or by refunding the amount you paid.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility for a refund">
        <p>You are eligible for a full refund in the following cases:</p>
        <LegalList
          items={[
            "We are unable to provide you with a seat for your selected time block after payment.",
            "Your booking is cancelled by the Library due to a technical error or duplicate payment.",
            "You cancel your booking within 24 hours of payment, before your membership period starts.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Requests that do not qualify for a refund">
        <LegalList
          items={[
            "Cancellation requested after the 24-hour window or after your membership period has started.",
            "Non-attendance or voluntary discontinuation of your membership.",
            "Termination of membership due to a breach of our Terms of Service or library rules.",
            "Change of mind about a time block, seat, or duration after the booking has started.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. How to request a refund">
        <p>
          Contact us within the timelines above by phone at +91 8804162854 or email at
          PhahendraBabulibrary@gmail.com with your booking ID and payment reference. You may also
          visit the library desk in person at Vill- Kharhat, P.O.- Phulmallik, P.S.- Sahebpur Kamal,
          Dist.- Begusarai, Bihar 851217.
        </p>
      </LegalSection>

      <LegalSection title="5. Refund processing">
        <LegalList
          items={[
            "Approved refunds are processed within 5–7 working days.",
            "Online (UPI/Razorpay) payments are refunded to the same payment method used for the booking.",
            "Cash payments are refunded in cash at the library desk.",
            "You will be notified by email or SMS once the refund is processed.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Partial refunds">
        <p>
          In exceptional cases where a portion of your membership period remains unused due to a
          Library-initiated change (for example, relocation of your seat), we may offer a pro-rata
          refund for the unused portion. The decision is made on a case-by-case basis at the
          Library&apos;s discretion.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact us">
        <p>
          Questions about this policy can be sent to PhahendraBabulibrary@gmail.com or
          +91 8804162854. We typically respond within one working day.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
