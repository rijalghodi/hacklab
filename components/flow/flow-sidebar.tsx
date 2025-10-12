"use client";

import React from "react";

import { builtInChips } from "@/lib/constants/chips";
import { CircuitChip } from "@/lib/types/chips";
import { getBgBorderStyle } from "@/lib/utils";

import { useChips, useDnd } from "./flow-store";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "../ui/sidebar";

export function FlowSidebar() {
  const { setDroppedName } = useDnd();
  const { savedChips } = useChips();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeName: string) => {
    console.log("onDragStart", nodeName);
    setDroppedName(nodeName);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Sidebar className="dark react-flow">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono">Built-in Chips</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-wrap gap-2">
              {builtInChips.map((chip) => (
                <div key={chip.name} onDragStart={(e) => onDragStart(e, chip.name)} draggable>
                  <ChipOptionComponent color={chip.color} name={chip.name} />
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono">Saved Chips</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-wrap gap-2">
              {savedChips?.map((chip: CircuitChip) => (
                <div key={chip.name} onDragStart={(e) => onDragStart(e, chip.name)} draggable>
                  <ChipOptionComponent color={chip.color} name={chip.name} />
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function ChipOptionComponent({ color, name }: { color?: string; name: string }) {
  return (
    <div
      className="rounded-xs p-2 font-mono box-border w-16 h-8 flex items-center justify-center text-sm font-semibold cursor-grab"
      style={{
        ...getBgBorderStyle(color),
      }}
    >
      {name}
    </div>
  );
}
