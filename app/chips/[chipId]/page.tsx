"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { useChips } from "@/hooks";

import { Circuit } from "@/components/flow/circuit";
import { FlowSidebarTrigger } from "@/components/flow/flow-sidebar";

export default function ChipPage() {
  const router = useRouter();

  let { chipId: chipIdParam } = useParams<{ chipId: string }>();
  const chipId = chipIdParam === "new" ? "" : chipIdParam;

  const { getChipById } = useChips();
  const currentCircuit = useMemo(() => {
    try {
      if (!chipId) {
        return null;
      }
      const chip = getChipById(chipId);
      if (!chip) {
        return null;
      }
      return chip;
    } catch (_error) {
      return null;
    }
  }, [chipId]);

  useEffect(() => {
    if (chipId && !currentCircuit) {
      router.replace("/chips/new");
    }
  }, [chipId, currentCircuit]);

  return (
    <div className="h-screen w-full relative bg-red-500">
      <FlowSidebarTrigger className="absolute top-1/2 -translate-y-1/2 left-4 z-10" />
      <Circuit initialCircuit={currentCircuit} />
    </div>
  );
}
