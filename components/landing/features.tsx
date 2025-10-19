"use client";

import { Folder, Save, SquareMousePointer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BRAND_NAME } from "@/lib/constants/brand";
import { cn } from "@/lib/utils";

type Feature = {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  video: string;
};

const FEATURES: Feature[] = [
  {
    id: 0,
    title: "Design your own circuits",
    description: "A drag and drop interface to add and connect logic gates.",
    icon: SquareMousePointer,
    video: "/demo.webm",
  },
  {
    id: 1,
    title: "Save your circuits",
    description: "Save your circuits to your local storage and use them later.",
    icon: Save,
    video: "/demo2.webm",
  },
  {
    id: 2,
    title: "Use saved circuits",
    description: "Use saved circuits in your own projects.",
    icon: Folder,
    video: "/demo.webm",
  },
];

const TIME_PER_FEATURE = 10000;

export function Features() {
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-cycle through features when not user interacting
  useEffect(() => {
    if (!isUserInteracting) {
      const interval = setInterval(() => {
        setActiveFeature((prev) => (prev + 1) % FEATURES.length);
      }, TIME_PER_FEATURE); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isUserInteracting]);

  // Handle user click on feature
  const handleFeatureClick = (featureId: number) => {
    setIsUserInteracting(true);
    setActiveFeature(featureId);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to resume auto-cycling after 5 seconds
    timeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, TIME_PER_FEATURE);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <section id="features" className="border-y">
      <div className="relative container mx-auto max-w-7xl border-x px-6 md:px-10 pt-24 pb-20 flex flex-col items-center justify-center">
        <div className="space-y-4 text-center">
          <h2 className="text-4xl font-bold text-foreground leading-snug">How {BRAND_NAME} Works?</h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Experience computer architecture like never before through hands-on exploration and interactive
            visualization.
          </p>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl border-x border-t grid grid-cols-2">
        <div className="flex flex-col relative">
          {FEATURES.map((feature, idx) => (
            <FeatureCard
              key={idx}
              feature={feature}
              active={activeFeature === feature.id}
              onClick={() => handleFeatureClick(feature.id)}
            />
          ))}
        </div>
        <div className="relative flex flex-col items-center justify-center border-l px-6 py-4">
          {FEATURES[activeFeature] && (
            <video
              src={FEATURES[activeFeature].video}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover rounded-xl"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, active, onClick }: { feature: Feature; active?: boolean; onClick?: () => void }) {
  return (
    <button
      data-active={active}
      className={cn(
        "relative flex flex-col items-start justify-start space-y-3 px-10 py-8 border-b last:border-b-0 w-full transition-all duration-100 cursor-pointer",
        "data-[active=true]:bg-accent data-[active=true]:border-l-4 data-[active=true]:border-l-primary",
        "hover:bg-accent/50",
      )}
      onClick={onClick}
    >
      <h3 className={`text-lg font-bold ${active ? "text-primary" : ""}`}>
        <feature.icon className={`inline-block size-4 mr-1 ${active ? "text-primary" : ""}`} /> {feature.title}
      </h3>
      <p className={`${active ? "text-foreground" : "text-muted-foreground"}`}>{feature.description}</p>
    </button>
  );
}
