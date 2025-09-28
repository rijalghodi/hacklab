import { ReactFlowProvider } from "@xyflow/react";
import React from "react";

import { Circuit } from "@/components/flow/circuit";
import { FlowSidebar } from "@/components/flow/flow-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function LabPage() {
  return (
    <div className="h-screen w-screen">
      <SidebarProvider>
        <FlowSidebar />
        <SidebarInset>
          <ReactFlowProvider>
            <Circuit />
          </ReactFlowProvider>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
