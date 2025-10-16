import { Edge, Node, useReactFlow } from "@xyflow/react";
import { MenuIcon } from "lucide-react";
import React from "react";

import { CircuitChip, Wire } from "@/lib/types/chips";
import { useSaveChipDialogStore } from "@/hooks/save-chip-dialog-store";
import { useCircuitPageParams } from "@/hooks/use-circuit-search-params";
import { useControllableOpen } from "@/hooks/use-controllable-open";

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
};

export function CircuitMenu(props: Props) {
  const { setChipId } = useCircuitPageParams();
  const { open, onOpenChange } = useControllableOpen(props);
  const { openDialog } = useSaveChipDialogStore();

  const handleNewChip = () => {
    setChipId(null);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="uppercase">
          <MenuIcon />
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="font-mono font-semibold w-52 uppercase">
        <DropdownMenuItem onClick={openDialog}>
          Save Chip
          <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNewChip}>
          New Chip
          <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          Delete Chip
          <DropdownMenuShortcut>Ctrl+⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
