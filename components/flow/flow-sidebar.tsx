"use client";

import React from "react";

import { builtInChips, builtInPorts } from "@/lib/constants/chips";
import { CircuitModule } from "@/lib/types/flow";
import { getBgBorderStyle } from "@/lib/utils";

import { useDnd, useSavedChips } from "./flow-store";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "../ui/sidebar";

export function FlowSidebar() {
  const { setDroppedName: setType } = useDnd();
  const { savedChips } = useSavedChips();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    console.log("onDragStart", nodeType);
    setType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Sidebar className="dark react-flow" onClick={() => setType("Helloooooo")}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono">Inputs & Outputs</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-wrap gap-2">
              {builtInPorts.map((port) => (
                <div key={port.name} onDragStart={(e) => onDragStart(e, port.name)} draggable>
                  <ChipOptionComponent color={port.color} name={port.name} />
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
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
            {savedChips?.map((chip: CircuitModule) => (
              <ChipOptionComponent key={chip.name} color={chip.color} name={chip.name} />
            ))}
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
