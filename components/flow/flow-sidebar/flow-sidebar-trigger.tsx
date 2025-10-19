import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { SidebarTrigger, Tooltip, TooltipContent, TooltipTrigger, useSidebar } from "@/components/ui";

export function FlowSidebarTrigger(props: { className?: string }) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger
          className={cn("h-12 w-7", props.className)}
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title="Toggle Chip Menu"
        >
          {open ? <ChevronLeft className="size-6" /> : <ChevronRight className="size-6" />}
        </SidebarTrigger>
      </TooltipTrigger>
      <TooltipContent side="right" className="font-mono text-base">
        {open ? "Hide Chips Menu" : "Show Chips Menu"}
      </TooltipContent>
    </Tooltip>
  );
}
