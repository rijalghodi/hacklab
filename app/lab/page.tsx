"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";

import { Circuit } from "@/components/flow/circuit";
import { FlowSidebar } from "@/components/flow/flow-sidebar";
import { useChips } from "@/components/flow/flow-store";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function LabPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeId = searchParams.get("nodeId");

  const { getChipById } = useChips();
  const circuit = useMemo(() => {
    try {
      if (!nodeId) {
        return null;
      }
      return getChipById(nodeId);
    } catch (_error) {
      return null;
    }
  }, [nodeId]);

  useEffect(() => {
    if (nodeId && !circuit) {
      router.replace("/lab");
    }
  }, [nodeId, circuit, router]);

  return (
    <div className="h-screen w-screen font-mono dark">
      <SidebarProvider>
        <FlowSidebar />
        <SidebarInset>
          <ReactFlowProvider>
            <Circuit initialCircuit={circuit} />
          </ReactFlowProvider>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
