import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WaitlistSection } from "@/components/landing/waitlist-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="-mt-[72px]">
        <Hero />
        <HowItWorks />
        <Features />
        <WaitlistSection />
      </main>
      <SiteFooter />
    </>
  );
}
