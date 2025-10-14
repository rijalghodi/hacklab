import { MenuIcon } from "lucide-react";
import React from "react";

import { useControllableOpen } from "@/hooks/use-controllable-open";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useSaveChipDialogStore } from "../../hooks/save-chip-dialog-store";

type Props = {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

export function CircuitMenu(props: Props) {
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

        <DropdownMenuItem>Save As</DropdownMenuItem>

        <DropdownMenuItem variant="destructive">Delete Chip</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
