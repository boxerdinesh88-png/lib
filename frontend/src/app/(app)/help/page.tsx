import { LifeBuoy, Mail, MapPin, Phone } from "lucide-react";

import { LegalPage, LegalSection } from "@/components/layout/legal-page";

export const metadata = {
  title: "Help Centre",
  description:
    "Get answers about booking a study seat, cash bookings, verification codes and more at Phahendra Babu Library.",
};

const HELP_LINKS = [
  {
    icon: Phone,
    label: "Call us",
    value: "+91 8804162854",
    href: "tel:+918804162854",
  },
  {
    icon: Mail,
    label: "Email us",
    value: "PhahendraBabulibrary@gmail.com",
    href: "mailto:PhahendraBabulibrary@gmail.com",
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: "Vill- Kharhat, P.O.- Phulmallik, P.S.- Sahebpur Kamal, Dist.- Begusarai, Bihar 851217",
    href: "https://www.google.com/maps/search/?api=1&query=Phahendra+Babu+Library+Begusarai",
  },
];

export default function HelpPage() {
  return (
    <LegalPage
      icon={LifeBuoy}
      badge="Help Centre"
      title="How can we help you?"
      subtitle="Everything you need to book, manage and enjoy your study seat at Phahendra Babu Library."
      updated="11 August 2026"
    >
      <LegalSection title="Getting started">
        <p>
          Create a free account with your name, mobile number and a valid email address. You will
          receive a one-time verification code to activate your account. Once verified, you can pick
          a time block, choose your seat and complete your monthly payment.
        </p>
      </LegalSection>

      <LegalSection title="How do I book a seat?">
        <p>
          Go to the Membership page, select the time block that suits your study schedule, and choose
          a seat from the interactive seat map. Complete the payment online with UPI or Razorpay, or
          request a cash booking. Your seat is reserved as soon as your booking is confirmed.
        </p>
      </LegalSection>

      <LegalSection title="What is a cash booking?">
        <p>
          If you choose to pay in cash, your seat is held for 3 days while you visit the library desk
          to pay. Once the library confirms your payment, your seat pass is activated automatically.
          If payment is not received within the window, the hold is released and the seat becomes
          available to other members.
        </p>
      </LegalSection>

      <LegalSection title="Can I change my photo or profile details?">
        <p>
          Yes. Sign in and open your Dashboard. You can update your profile photo and other account
          details there. Photo updates take effect immediately across the site.
        </p>
      </LegalSection>

      <LegalSection title="I didn't receive my verification code">
        <p>
          Wait a minute or two, then check your spam or promotions folder. If the code still hasn&apos;t
          arrived, use the &quot;Resend code&quot; option on the verification screen. Still stuck?
          Contact us and we will sort it out.
        </p>
      </LegalSection>

      <LegalSection title="Seat already taken">
        <p>
          Seats are shown live on the seat map. If a seat is unavailable, pick another nearby seat or
          a different time block. Seats held without payment are released automatically, so keep an
          eye on the map for last-minute openings.
        </p>
      </LegalSection>

      <LegalSection title="Reach out to us">
        <p>Our team is happy to help you by phone, email or in person at the library.</p>
        <div className="grid gap-3 pt-1">
          {HELP_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition hover:border-primary-400 hover:shadow-soft dark:border-white/10 dark:bg-white/5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                <link.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  {link.label}
                </span>
                <span className="mt-0.5 block break-words text-sm font-medium text-secondary-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {link.value}
                </span>
              </span>
            </a>
          ))}
        </div>
      </LegalSection>
    </LegalPage>
  );
}
