import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { SidebarTrigger, useSidebar } from "../../ui/sidebar";

export function FlowSidebarTrigger(props: { className?: string }) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <SidebarTrigger
      className={cn("h-12 w-7", props.className)}
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      title="Toggle Chip Menu"
    >
      {open ? <ChevronLeft className="size-6" /> : <ChevronRight className="size-6" />}
    </SidebarTrigger>
  );
}
