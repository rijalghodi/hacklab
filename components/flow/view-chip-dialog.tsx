"use client";

import { ReactFlowProvider } from "@xyflow/react";
import React, { useMemo } from "react";

import { useChips } from "@/hooks";
import { useViewChipDialogStore } from "@/hooks/use-view-chip-dialog-store";

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";

import { Circuit } from "./circuit";

export function ViewChipDialog() {
  const { open, nodeStack, closeViewChip } = useViewChipDialogStore();
  const { getChip } = useChips();

  const chipDef = useMemo(() => {
    if (!nodeStack) return null;
    const chipName = nodeStack[nodeStack.length - 1];
    const chipDef = getChip(chipName);
    if (!chipDef) return null;
    return chipDef;
  }, [nodeStack, getChip]);

  const handleClose = () => {
    closeViewChip();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-screen sm:h-screen font-mono flex flex-col" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-8">
            <Button variant="outline" size="lg" onClick={handleClose}>
              Back
            </Button>
            <DialogTitle className="text-xl font-bold text-center">Viewing: {chipDef?.name}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="rounded-2xl overflow-hidden h-full w-full flex-1">
          <ReactFlowProvider>
            <Circuit initialCircuit={chipDef} viewOnly={true} withBackground={false} showTitle={false} />
          </ReactFlowProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
