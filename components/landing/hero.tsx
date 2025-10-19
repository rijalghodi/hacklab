import Image from "next/image";
import Link from "next/link";

import { BRAND_NAME } from "@/lib/constants/brand";

import { Button } from "@/components/ui/button";

import HeroImage from "@/public/hero.png";

export function Hero() {
  return (
    <section id="hero">
      {/* Hero Content */}
      <div className="container mx-auto max-w-7xl border-x px-6 md:px-10 py-24 flex flex-col items-center justify-center">
        <div className="space-y-8 w-full max-w-2xl">
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl leading-normal font-bold tracking-tight text-center">
              Learn How Computers Works from <span className="text-brand">Scratch</span>
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground text-center">
              <strong>{BRAND_NAME}</strong> is a free logic circuit simulator that helps you learn how computers work by{" "}
              <strong>building them</strong> step by step, starting from simple <strong>NAND chips</strong>.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Button size="lg" variant="default" asChild>
              <Link href="/chips/new">Start Building</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="container relative mx-auto max-w-7xl border-x border-t px-6 md:px-14 py-12 flex flex-col items-center justify-center">
        <div className="w-2 h-2 bg-foreground absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="w-2 h-2 bg-foreground absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"></div>
        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden shadow-xl">
          <Image
            src={HeroImage}
            alt="Hero Image"
            width={1200}
            height={800}
            className="aspect-[16/9] w-full object-fill"
          />
        </div>
      </div>
    </section>
  );
}
