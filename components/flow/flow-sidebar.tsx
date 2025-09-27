import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "../ui/sidebar";
import { CircuitModule } from "@/lib/types/flow";

type Props = {
  savedChips?: CircuitModule[];
};

export function FlowSidebar({ savedChips }: Props) {
  return (
    <Sidebar className="w-[300px]">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Inputs & Outputs</SidebarGroupLabel>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Built-in Chips</SidebarGroupLabel>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Saved Chips</SidebarGroupLabel>
          <SidebarGroupContent>
            {savedChips?.map((chip) => (
              <div key={chip.name}>{chip.name}</div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
