"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import { builtInChips } from "@/lib/constants/chips";
import { CircuitChip } from "@/lib/types/chips";
import { getBgBorderTextColor } from "@/lib/utils";

import { useChips, useDnd } from "./flow-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "../ui/sidebar";

type ContextMenuState = {
  position: { x: number; y: number };
  chipName: string;
  chipId: string;
};

export function FlowSidebar() {
  const { setDroppedName } = useDnd();
  const { savedChips } = useChips();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Memoized handlers for better performance
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, nodeName: string) => {
      setDroppedName(nodeName);
      event.dataTransfer.effectAllowed = "move";
    },
    [setDroppedName],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent, chipName: string, chipId: string) => {
    e.preventDefault();
    setIsMenuOpen(true);
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      chipName,
      chipId,
    });
  }, []);

  const handleMenuClose = useCallback((open: boolean) => {
    setIsMenuOpen(open);
    if (!open) {
      setContextMenu(null);
    }
  }, []);

  return (
    <Sidebar className="react-flow dark">
      <SidebarHeader />
      <SidebarContent>
        {/* Built-in Chips Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono uppercase">Built-in Chips</SidebarGroupLabel>
          <SidebarGroupContent>
            <ChipGrid>
              {builtInChips.map((chip) => (
                <ChipOptionComponent
                  key={chip.name}
                  color={chip.color}
                  name={chip.name}
                  chipId={chip.id}
                  onDragStart={(e) => handleDragStart(e, chip.name)}
                />
              ))}
            </ChipGrid>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Saved Chips Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono uppercase">Saved Chips</SidebarGroupLabel>
          <SidebarGroupContent>
            <ChipGrid>
              {savedChips?.map((chip: CircuitChip) => (
                <ChipOptionComponent
                  key={chip.name}
                  color={chip.color}
                  name={chip.name}
                  chipId={chip.id}
                  onDragStart={(e) => handleDragStart(e, chip.name)}
                  onContextMenu={handleContextMenu}
                  selected={contextMenu?.chipName === chip.name}
                />
              ))}
            </ChipGrid>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Context Menu */}
        <ChipOptionMenu
          open={isMenuOpen}
          onOpenChange={handleMenuClose}
          menuPosition={contextMenu?.position}
          chipName={contextMenu?.chipName}
          chipId={contextMenu?.chipId}
        />
      </SidebarContent>
    </Sidebar>
  );
}

function ChipGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

type ChipOptionComponentProps = {
  color?: string;
  name: string;
  chipId?: string | null;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent, chipName: string, chipId: string) => void;
  selected?: boolean;
};

function ChipOptionComponent({ color, name, chipId, onDragStart, onContextMenu, selected }: ChipOptionComponentProps) {
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      onContextMenu?.(e, name, chipId ?? "");
    },
    [onContextMenu, name, chipId],
  );

  return (
    <div
      data-selected={selected}
      className="p-2 font-mono box-border w-16 h-8 flex items-center justify-center text-sm font-semibold cursor-grab rounded-sm data-[selected=true]:ring-ring data-[selected=true]:ring-2"
      style={getBgBorderTextColor(color)}
      onDragStart={onDragStart}
      onContextMenu={handleContextMenu}
      draggable
    >
      {name}
    </div>
  );
}

type ChipOptionMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuPosition?: { x: number; y: number } | null;
  chipName?: string | null;
  chipId?: string | null;
};

function ChipOptionMenu({ open, menuPosition, onOpenChange, chipName, chipId }: ChipOptionMenuProps) {
  const router = useRouter();

  // Early return for invalid state
  if (!chipName || !chipId) return null;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        className="sr-only fixed"
        style={{
          left: menuPosition?.x,
          top: menuPosition?.y,
        }}
      />
      <DropdownMenuContent className="font-mono font-semibold uppercase" align="start">
        <DropdownMenuLabel>{chipName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            router.push(`/lab?nodeId=${chipId}`);
          }}
        >
          Open
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
