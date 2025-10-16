"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { Circuit } from "@/components/flow/circuit";
import { useChips } from "@/components/flow/flow-store";

export default function ChipPage() {
  const router = useRouter();

  let { chipId: chipIdParam } = useParams<{ chipId: string }>();
  const chipId = chipIdParam === "new" ? "" : chipIdParam;

  const { getChipById } = useChips();
  const circuit = useMemo(() => {
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
    if (chipId && !circuit) {
      router.replace("/chips/new");
    }
  }, [chipId, circuit, router]);

  return <Circuit initialCircuit={circuit} />;
}
