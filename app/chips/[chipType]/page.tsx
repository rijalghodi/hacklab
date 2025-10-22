"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { CircuitChipDB } from "@/lib/db/chips-db";
import { getSavedChip } from "@/hooks";

import { Circuit, FlowSidebarTrigger } from "@/components/flow";

export default function ChipPage() {
  const router = useRouter();

  let { chipType: chipTypeParam } = useParams<{ chipType: string }>();
  const chipType = chipTypeParam === "new" ? null : chipTypeParam;

  const [currentCircuit, setCurrentCircuit] = useState<CircuitChipDB | null>(null);

  // const currentCircuit = useMemo(() => {
  //   if (!chipType) return null;
  //   return savedChip;
  // }, [chipType, savedChip]);

  useEffect(() => {
    const findSavedChip = async () => {
      if (!chipType) return;
      const savedChip = await getSavedChip(chipType);
      console.log("savedChip", savedChip);
      if (savedChip) {
        setCurrentCircuit(savedChip);
      }
      if (chipType && !savedChip) {
        router.replace("/chips/new");
      }
    };
    findSavedChip();
  }, [chipType, router]);

  return (
    <div className="h-full w-full relative">
      <FlowSidebarTrigger className="absolute top-1/2 -translate-y-1/2 left-4 z-10" />
      <Circuit initialCircuit={currentCircuit} />
    </div>
  );
}
