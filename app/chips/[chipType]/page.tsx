"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { useChips, useCircuitKeyboardShortcuts } from "@/hooks";

import { Circuit, FlowSidebarTrigger } from "@/components/flow";

export default function ChipPage() {
  const router = useRouter();
  useCircuitKeyboardShortcuts();

  let { chipType: chipTypeParam } = useParams<{ chipType: string }>();
  const chipType = chipTypeParam === "new" ? "" : chipTypeParam;

  const { getChip } = useChips();
  const currentCircuit = useMemo(() => {
    try {
      if (!chipType) {
        return null;
      }
      const chip = getChip(chipType);
      if (!chip) {
        return null;
      }
      return chip;
    } catch (_error) {
      return null;
    }
  }, [chipType]);

  useEffect(() => {
    if (chipType && !currentCircuit) {
      router.replace("/chips/new");
    }
  }, [chipType, currentCircuit]);

  return (
    <div className="h-screen w-full relative">
      <FlowSidebarTrigger className="absolute top-1/2 -translate-y-1/2 left-4 z-10" />
      <Circuit initialCircuit={currentCircuit} />
    </div>
  );
}
