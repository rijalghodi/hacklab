import { ReactFlowProvider } from "@xyflow/react";
import React from "react";

import { FlowSidebar } from "@/components/flow/flow-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type Props = {
  children: React.ReactNode;
};

export default function ChipTemplate({ children }: Props) {
  return (
    <div className="h-screen w-screen font-mono dark">
      <ReactFlowProvider>
        <SidebarProvider>
          <FlowSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </ReactFlowProvider>
    </div>
  );
}
