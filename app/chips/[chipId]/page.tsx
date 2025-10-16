"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { Circuit } from "@/components/flow/circuit";
import { FlowSidebar } from "@/components/flow/flow-sidebar";
import { useChips } from "@/components/flow/flow-store";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function LabPage() {
  const router = useRouter();

  const { chipId } = useParams<{ chipId: string }>();

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

  return (
    <div className="h-screen w-screen font-mono dark">
      <ReactFlowProvider>
        <SidebarProvider>
          <FlowSidebar />
          <SidebarInset>
            <Circuit initialCircuit={circuit} />
          </SidebarInset>
        </SidebarProvider>
      </ReactFlowProvider>
    </div>
  );
}
