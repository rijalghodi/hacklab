import { Github } from "lucide-react";
import Link from "next/link";

import { BRAND_NAME, PROJECT_GITHUB_URL } from "@/lib/constants/brand";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <>
      {/* Header Section */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <span className="font-mono text-xl font-bold text-foreground">{BRAND_NAME}</span>
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

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer Section */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <Logo className="h-6 w-6" />
              <span className="font-mono text-sm font-medium text-muted-foreground">{BRAND_NAME}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© 2024 {BRAND_NAME}</span>
              <span>•</span>
              <Link href={PROJECT_GITHUB_URL} className="hover:text-foreground transition-colors">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
