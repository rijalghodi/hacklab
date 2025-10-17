"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { useChips } from "@/hooks";

import { Circuit } from "@/components/flow/circuit";

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

  return <Circuit initialCircuit={currentCircuit} />;
}
