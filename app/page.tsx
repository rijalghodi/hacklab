import { About } from "@/components/landing/about";
import { Examples } from "@/components/landing/examples";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { LandingLayout } from "@/components/landing/layout";

export default function Home() {
  return (
    <LandingLayout>
      <Hero />
      <Features />
      <Examples />
      <About />
    </LandingLayout>
  );
}
