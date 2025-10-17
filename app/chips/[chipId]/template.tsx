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
      {/* <ViewChipDialog /> */}
      <ReactFlowProvider>
        <SidebarProvider>
          <FlowSidebar />
          <SidebarInset>
            {/* <SidebarTrigger /> */}
            {children}
          </SidebarInset>
        </SidebarProvider>
      </ReactFlowProvider>
    </div>
  );
}
