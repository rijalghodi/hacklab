"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useState } from "react";

import { builtInChips } from "@/lib/constants/chips";
import { CircuitChip } from "@/lib/types/chips";
import { cn, getBgBorderTextColor } from "@/lib/utils";
import { useChips, useDndStore } from "@/hooks";
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
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";

type ContextChip = {
  name?: string;
  chipType: string;
};
type ContextMenuState = {
  position: { x: number; y: number };
  chip: ContextChip;
};

export function FlowSidebar() {
  const { setDropped } = useDndStore();
  const { savedChips } = useChips();
  const { chipType } = useCircuitPageParams();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Memoized handlers for better performance
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, chipType: string) => {
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
                <ChipOptionComponent
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
            {savedChips.length > 0 ? (
              <ChipGrid>
                {savedChips?.map((chip: CircuitChip) => (
                  <ChipOptionComponent
                    key={chip.chipType}
                    color={chip.color}
                    name={chip.name}
                    chipType={chip.chipType}
                    onDragStart={(e) => handleDragStart(e, chip.chipType)}
                    onContextMenu={handleContextMenu}
                    selected={contextMenu?.chip?.chipType === chip.chipType && !!contextMenu?.chip?.chipType}
                    disabled={chip.chipType === chipType}
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
          chip={contextMenu?.chip}
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
  name?: string;
  chipType: string;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent, chip: ContextChip) => void;
  selected?: boolean;
  disabled?: boolean;
} & Omit<React.ComponentProps<"div">, "onContextMenu">;

function ChipOptionComponent({
  color,
  name,
  chipType,
  onDragStart,
  onContextMenu,
  selected,
  disabled,
  ...props
}: ChipOptionComponentProps) {
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      onContextMenu?.(e, { name, chipType });
    },
    [onContextMenu, name, chipType],
  );

  return (
    <div
      data-selected={selected}
      className={cn(
        "px-2 py-1 font-mono box-border min-w-18 h-10 flex items-center justify-center text-base font-semibold cursor-grab rounded-sm",
        "data-[selected=true]:ring-ring/80 data-[selected=true]:ring-3",
        "hover:ring-ring/80 hover:ring-3",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      style={getBgBorderTextColor(color)}
      onDragStart={onDragStart}
      onContextMenu={handleContextMenu}
      draggable={!disabled}
      title={disabled ? "Cannot add the chip due to cyclic dependency" : ""}
      {...props}
    >
      {name}
    </div>
  );
}

type ChipOptionMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuPosition?: { x: number; y: number } | null;
  chip?: {
    name?: string;
    chipType: string;
  };
};

function ChipOptionMenu({ open, menuPosition, onOpenChange, chip }: ChipOptionMenuProps) {
  const { navigateToChip } = useCircuitPageParams();
  const { deleteChipWithConfirm } = useDeleteChipHandler();

  if (!chip?.chipType) return null;

  const handleOpen = () => {
    navigateToChip(chip.chipType);
  };

  const handleDelete = () => {
    deleteChipWithConfirm(chip.chipType);
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
        <DropdownMenuLabel>{chip.name || chip.chipType}</DropdownMenuLabel>
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
