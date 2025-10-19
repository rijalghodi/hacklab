import Link from "next/link";
import React from "react";

import { BRAND_NAME, PROJECT_GITHUB_URL } from "@/lib/constants/brand";

import { Button } from "../ui/button";
import { Logo } from "../ui/logo";

export function About() {
  return (
    <section id="about" className="border-t">
      <div className="container mx-auto max-w-7xl border-x px-6 md:px-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-foreground leading-snug">About {BRAND_NAME}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This is my personal project to understand how computers work. It is inspired by the book{" "}
                <a
                  href="https://www.nand2tetris.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Nand2Tetris
                </a>{" "}
                and{" "}
                <a
                  href="https://github.com/SebLague/Digital-Logic-Sim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Digital Logic Sim
                </a>{" "}
                by Sebastian League.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I want to make this circuit simulation accessible, easy, and user-friendly so people can learn computer
                architecture through hands-on experimentation and visual understanding.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                For more information, please visit the{" "}
                <Link href={PROJECT_GITHUB_URL} className="text-primary underline">
                  GitHub repository
                </Link>
                .
              </p>
            </div>
            <div className="flex items-center justify-start">
              <Button size="lg" variant="default" asChild>
                <Link href="/chips/new">Start Building</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Visual/Image placeholder */}
          <div className="items-center justify-center hidden lg:flex">
            <div className="w-full max-w-md aspect-square rounded-2xl bg-muted/50 flex items-center justify-center">
              <div className="text-center space-y-10">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Logo />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Learning Through Building</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
