import { MenuIcon } from "lucide-react";
import React from "react";

import { useCircuitPageParams, useControllableOpen, useSaveChipDialogStore } from "@/hooks";
import { useDeleteChipHandler } from "@/hooks";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui";

type Props = {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

export function CircuitMenu(props: Props) {
  const { navigateToChip, chipType } = useCircuitPageParams();
  const { open, onOpenChange } = useControllableOpen(props);
  const { openDialog: openSaveChipDialog } = useSaveChipDialogStore();
  const { deleteChipWithConfirm } = useDeleteChipHandler();
  const { undo, redo, canUndo, canRedo } = props;

  const handleNewChip = () => {
    navigateToChip(null);
  };

  const handleDeleteChip = () => {
    if (!chipType) return;
    deleteChipWithConfirm(chipType);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="uppercase">
          <MenuIcon />
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="font-mono font-semibold w-60 uppercase">
        <DropdownMenuItem onClick={handleNewChip}>
          New Chip
          <DropdownMenuShortcut>Ctrl+Shift+N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openSaveChipDialog}>
          Save Chip
          <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canUndo} onClick={undo}>
          Undo
          <DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canRedo} onClick={redo}>
          Redo
          <DropdownMenuShortcut>Ctrl+Y</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" disabled={!chipType} onClick={handleDeleteChip}>
          Delete Chip
          <DropdownMenuShortcut>Ctrl+⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
