import React from "react";

import { useCircuitPageParams } from "@/hooks/use-circuit-page-params";
import { useDeleteChipHandler } from "@/hooks/use-delete-chip-handler";
import { useViewChipDialogStore } from "@/hooks/use-view-chip-dialog-store";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export type ChipContextMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuPosition?: { x: number; y: number } | null;
  chip?: {
    name?: string;
    chipType: string;
  };
};

export function ChipContextMenu({ open, menuPosition, onOpenChange, chip }: ChipContextMenuProps) {
  const { navigateToChip } = useCircuitPageParams();
  const { deleteChipWithConfirm } = useDeleteChipHandler();
  const { viewChip } = useViewChipDialogStore();

  if (!chip?.chipType) return null;

  const handleOpen = () => {
    navigateToChip(chip.chipType);
  };

  const handleDelete = () => {
    deleteChipWithConfirm(chip.chipType);
  };

  const handleView = () => {
    viewChip(chip.chipType);
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
        <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
