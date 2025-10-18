"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useState } from "react";

import { builtInChips } from "@/lib/constants/chips";
import { CircuitChip } from "@/lib/types/chips";
import { cn, getBgBorderTextColor } from "@/lib/utils";
import { useChips, useDnd } from "@/hooks";
import { useCircuitPageParams } from "@/hooks/use-circuit-page-params";
import { useDeleteChipHandler } from "@/hooks/use-delete-chip-handler";

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
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";

type ContextMenuState = {
  position: { x: number; y: number };
  chipName: string;
  chipId: string;
};

export function FlowSidebar() {
  const { setDroppedName } = useDnd();
  const { savedChips } = useChips();
  const { chipId } = useCircuitPageParams();

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
      <SidebarContent className="p-1">
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
                  // selected={chip.id === chipId}
                />
              ))}
            </ChipGrid>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Saved Chips Section */}

        <SidebarGroup>
          <SidebarGroupLabel className="font-mono uppercase">Saved Chips</SidebarGroupLabel>
          <SidebarGroupContent>
            {savedChips.length > 0 ? (
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
                    disabled={chip.id === chipId}
                  />
                ))}
              </ChipGrid>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-6 px-2">No saved chips</div>
            )}
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
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

type ChipOptionComponentProps = {
  color?: string;
  name: string;
  chipId?: string | null;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent, chipName: string, chipId: string) => void;
  selected?: boolean;
  disabled?: boolean;
};

function ChipOptionComponent({
  color,
  name,
  chipId,
  onDragStart,
  onContextMenu,
  selected,
  disabled,
}: ChipOptionComponentProps) {
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      onContextMenu?.(e, name, chipId ?? "");
    },
    [onContextMenu, name, chipId],
  );

  return (
    <div
      data-selected={selected}
      className={cn(
        "px-2 py-1 font-mono box-border min-w-18 h-10 flex items-center justify-center text-base font-semibold cursor-grab rounded-sm data-[selected=true]:ring-ring/80 data-[selected=true]:ring-3",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      style={getBgBorderTextColor(color)}
      onDragStart={onDragStart}
      onContextMenu={handleContextMenu}
      draggable={!disabled}
      title={disabled ? "Cannot add the chip due to cyclic dependency" : ""}
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
  const { navigateToChipId } = useCircuitPageParams();
  const { deleteChipWithConfirm } = useDeleteChipHandler();

  if (!chipName || !chipId) return null;

  const handleOpen = () => {
    navigateToChipId(chipId);
  };

  const handleDelete = () => {
    deleteChipWithConfirm(chipId);
  };

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
        <DropdownMenuItem onClick={handleOpen}>Open</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
