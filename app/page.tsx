import { ReactFlowProvider } from "@xyflow/react";
import { BookOpen, Code, Cpu, Eye, Github, Monitor, Play, Settings } from "lucide-react";
import Link from "next/link";

import { PROJECT_GITHUB_URL } from "@/lib/constants/brand";

import { CircuitDemo } from "@/components/flow";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      {/* Header Section */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl font-bold text-foreground">HackLab</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/chips/new">Get Started</Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href={PROJECT_GITHUB_URL}>
                  <Github className="h-5 w-5" />
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Hero Content */}
            <div className="space-y-12">
              <div className="space-y-8">
                <h1 className="text-4xl sm:text-5xl leading-snug font-bold tracking-normal text-foreground">
                  Build Computers from <span className="text-primary">Scratch</span>
                </h1>
                <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground">
                  HackLab is an interactive computer simulation inspired by <em>Nand to Tetris</em>. Learn how computers
                  work by building them from the ground up, starting with simple NAND gates all the way to a complete
                  computers.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" variant="default" asChild>
                  <Link href="/chips/new">Start Building</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="flex aspect-[4/3] sm:aspect-[4/3] items-center justify-center rounded-2xl sm:p-6">
                <ReactFlowProvider>
                  <CircuitDemo />
                </ReactFlowProvider>
                {/* <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                    <Cpu className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">Interactive NAND Gate</h3>
                  <p className="text-muted-foreground">Click the input nodes to see the logic in action</p> */}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Video Section */}
      <section id="video" className="px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex aspect-[3/4] sm:aspect-video items-center justify-center bg-muted/50">
              <div className="space-y-4 p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Play className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold leading-snug text-foreground">See HackLab in Action</h3>
                <p className="mx-auto max-w-md text-muted-foreground text-lg leading-relaxed"></p>
                <Button size="lg" className="mt-4">
                  Watch Demo Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-4xl font-bold text-foreground leading-snug">Why HackLab?</h2>
            <p className="mx-auto max-w-3xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Experience computer architecture like never before through hands-on exploration and interactive
              visualization.
            </p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Hierarchical Visualization</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore the complete structure from NAND gates, flip-flops, registers, ALU, CPU, RAM, up to the complete
                Hack computer.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Exploration Mode</h3>
              <p className="text-muted-foreground">
                Click on any block to reveal its implementation, either in HDL (Hardware Description Language) or basic
                logic composition.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Interactive Simulation</h3>
              <p className="text-muted-foreground">
                Design or replicate components, run them, and verify against specifications in real-time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Hack Language Support</h3>
              <p className="text-muted-foreground">
                Load and execute programs written in Hack assembly, and run higher-level Jack code on your simulated
                computer.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Educational Focus</h3>
              <p className="text-muted-foreground">
                Bridges theoretical computer science with hands-on practice, showing the full path from bit to operating
                system.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Monitor className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Visual Learning</h3>
              <p className="text-muted-foreground">
                Make learning computer architecture tangible through direct exploration, experimentation, and
                visualization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-foreground leading-snug">Ready to Build Your First Computer?</h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Join thousands of students learning computer architecture through interactive simulation.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/chips/new">Start Building Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
