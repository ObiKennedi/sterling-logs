import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { Platforms } from "@/components/Platforms";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <Platforms />
      <Pricing />
      <FAQ />
    </>
  );
}