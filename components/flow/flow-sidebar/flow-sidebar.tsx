"use client";

import React, { useCallback, useState } from "react";

import { builtInChips } from "@/lib/constants/chips";
import { CircuitChipDB } from "@/lib/db/chips-db";
import { logger } from "@/lib/logger";
import { useAllChildChipTypes,useDndStore, useSavedChips } from "@/hooks";
import { useCircuitPageParams } from "@/hooks/use-circuit-page-params";

import { ChipContextMenu } from "./chip-context-menu";
import { ChipGrid } from "./chip-grid";
import { ChipItem, ContextChip } from "./chip-item";
// import { useChipOperations } from "./use-chip-operations";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "../../ui/sidebar";

type ContextMenuState = {
  position: { x: number; y: number };
  chip: ContextChip;
};

export function FlowSidebar() {
  const { setDropped } = useDndStore();
  const savedChips = useSavedChips();
  const { chipType } = useCircuitPageParams();
  const childChipTypes = chipType ? useAllChildChipTypes(chipType) : [];

  console.log("childChipTypes", childChipTypes);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Memoized handlers for better performance
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, chipType: string) => {
      logger.debug({ group: "FlowSidebar", message: `handleDragStart: chipType=${chipType}`, data: { event } });
      setDropped(chipType);
      event.dataTransfer.effectAllowed = "move";
    },
    [setDropped],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent, chip: ContextChip) => {
    e.preventDefault();
    setIsMenuOpen(true);
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      chip: {
        name: chip.name,
        chipType: chip.chipType,
      },
    });
  }, []);

  const handleMenuClose = useCallback((open: boolean) => {
    setIsMenuOpen(open);
    if (!open) {
      setContextMenu(null);
    }
  }, []);

  return (
    <Sidebar className="react-flow dark" variant="inset">
      <SidebarContent className="p-1 rounded-xl overflow-hidden">
        {/* Built-in Chips Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono uppercase">Built-in Chips</SidebarGroupLabel>
          <SidebarGroupContent>
            <ChipGrid>
              {builtInChips.map((chip) => (
                <ChipItem
                  key={chip.chipType}
                  color={chip.color}
                  name={chip.name}
                  chipType={chip.chipType}
                  onDragStart={(e) => handleDragStart(e, chip.id)}
                />
              ))}
            </ChipGrid>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Saved Chips Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono uppercase">Saved Chips</SidebarGroupLabel>
          <SidebarGroupContent>
            {savedChips?.length && savedChips.length > 0 ? (
              <ChipGrid>
                {savedChips?.map((chip: CircuitChipDB) => (
                  <ChipItem
                    key={chip.chipType}
                    color={chip.color}
                    name={chip.name}
                    chipType={chip.chipType}
                    onDragStart={(e) => handleDragStart(e, chip.chipType)}
                    onContextMenu={handleContextMenu}
                    selected={contextMenu?.chip?.chipType === chip.chipType && !!contextMenu?.chip?.chipType}
                    disabled={chip.chipType === chipType || childChipTypes.includes(chip.chipType)}
                  />
                ))}
              </ChipGrid>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-6 px-2">No saved chips</div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Context Menu */}
        <ChipContextMenu
          open={isMenuOpen}
          onOpenChange={handleMenuClose}
          menuPosition={contextMenu?.position}
          chip={contextMenu?.chip}
        />
      </SidebarContent>
    </Sidebar>
  );
}
