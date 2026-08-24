import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Reviews } from "@/components/landing/reviews";
import { Showcase } from "@/components/landing/showcase";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Showcase />
        <Features />
        <HowItWorks />
        <Pricing />
        <Reviews />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
