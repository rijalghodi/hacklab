import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { SaveChipDialog } from "./save-chip-dialog";
import { useControllableOpen } from "@/hooks/use-controllable-open";
import { MenuIcon } from "lucide-react";
import { useSaveChipDialogStore } from "./save-chip-dialog-store";

type Props = {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

export function Menu(props: Props) {
  const { open, onOpenChange } = useControllableOpen(props);
  const { openDialog } = useSaveChipDialogStore();

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="uppercase">
          <MenuIcon />
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="font-mono font-semibold w-48 uppercase">
        <DropdownMenuItem onClick={openDialog}>
          Save Chip
          <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem>
          Save As
          {/* <DropdownMenuShortcut>Ctrl+Alt+S</DropdownMenuShortcut> */}
        </DropdownMenuItem>

        <DropdownMenuItem>
          Delete Chip
          {/* <DropdownMenuShortcut>Ctrl+Delete</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
