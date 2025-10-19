import { Play } from "lucide-react";

import { BRAND_NAME } from "@/lib/constants/brand";

import { Button } from "@/components/ui/button";

export function Demo() {
  return (
    <>
      {/* Video Section */}
      <section id="video" className="px-4 py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex aspect-[3/4] sm:aspect-video items-center justify-center bg-muted/50">
              <div className="space-y-4 p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Play className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold leading-snug text-foreground">See {BRAND_NAME} in Action</h3>
                <p className="mx-auto max-w-md text-muted-foreground text-lg leading-relaxed"></p>
                <Button size="lg" className="mt-4">
                  Watch Demo Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
