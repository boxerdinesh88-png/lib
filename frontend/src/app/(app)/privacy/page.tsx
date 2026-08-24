import { ShieldCheck } from "lucide-react";

import { LegalList, LegalPage, LegalSection } from "@/components/layout/legal-page";

export const metadata = {
  title: "Privacy Policy",
  description: "How Phahendra Babu Library collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      icon={ShieldCheck}
      badge="Privacy Policy"
      title="Privacy Policy"
      subtitle="How Phahendra Babu Library collects, uses and protects your personal information."
      updated="11 August 2026"
    >
      <LegalSection title="1. Information we collect">
        <p>When you register and use the service, we collect information you provide directly:</p>
        <LegalList
          items={[
            "Full name, email address and mobile number.",
            "Gender, class or standard, purpose of joining and Wi-Fi device name.",
            "A profile photo and a copy of your identity document (e.g. Aadhaar card) for verification.",
            "Booking and payment details, including time block, seat and payment method.",
            "Technical information such as your IP address and device details for security and anti-abuse purposes.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How we use your information">
        <LegalList
          items={[
            "To create and manage your account and verify your identity.",
            "To process bookings, payments and seat allocations.",
            "To send booking confirmations, verification codes and membership reminders.",
            "To improve the service, prevent fraud and comply with legal obligations.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Legal basis">
        <p>
          We process your information to perform our contract with you (delivering your booking and
          membership), to comply with our legal obligations, and to pursue our legitimate interest
          in operating a secure and reliable service.
        </p>
      </LegalSection>

      <LegalSection title="4. Sharing of information">
        <p>
          We do not sell your personal information. We share information only where necessary:
        </p>
        <LegalList
          items={[
            "With payment providers (such as Razorpay) to process your payments securely.",
            "With service providers who help us operate the website and send emails.",
            "With law enforcement or authorities where required by law.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Data security">
        <p>
          We use appropriate technical and organisational measures to protect your information,
          including encrypted connections (HTTPS), secure storage of credentials, and restricted
          access to personal data. No method of transmission over the internet is 100% secure, but
          we work hard to protect your data.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          We keep your account and booking records for as long as your account is active or as needed
          to provide the service, comply with tax and legal requirements, and resolve disputes. When
          information is no longer needed, we delete or anonymise it.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>You have the right to:</p>
        <LegalList
          items={[
            "Access the personal information we hold about you.",
            "Request correction of inaccurate or incomplete information.",
            "Request deletion of your account and personal information, subject to legal retention requirements.",
            "Withdraw consent where processing is based on consent.",
          ]}
        />
        <p>
          To exercise any of these rights, contact us using the details at the end of this policy.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies & local storage">
        <p>
          The website uses browser local storage to keep you signed in and remember preferences such
          as your theme. We use secure session tokens rather than storing passwords on your device.
        </p>
      </LegalSection>

      <LegalSection title="9. Children's privacy">
        <p>
          Our service is intended for students and professionals. If you are under 18, please use the
          service with the involvement of a parent or guardian. We do not knowingly collect personal
          information from children without appropriate consent.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to this policy">
        <p>
          We may update this policy from time to time. The latest version will always be available on
          this page with its last-updated date.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact us">
        <p>
          For any privacy questions or requests, contact us at PhahendraBabulibrary@gmail.com or
          +91 8804162854, or in person at Vill- Kharhat, P.O.- Phulmallik, P.S.- Sahebpur Kamal,
          Dist.- Begusarai, Bihar 851217.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
