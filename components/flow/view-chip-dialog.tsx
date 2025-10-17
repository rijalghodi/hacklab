"use client";

import { Edge, Node, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import React, { useMemo } from "react";

import { CircuitChip, Wire } from "@/lib/types/chips";
import { useViewChipDialogStore } from "@/hooks/use-view-chip-dialog-store";

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";

import { Circuit } from "./circuit";

export function ViewChipDialog() {
  const { open, nodeStack, closeViewChip } = useViewChipDialogStore();
  const { getNode } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();

  const chipDef = useMemo(() => {
    console.log("678 nodeStack", nodeStack);
    if (!nodeStack) return null;
    const chipDef = getNode(nodeStack[nodeStack.length - 1]);

    console.log("678 chipDef", chipDef);
    if (!chipDef) return null;
    return chipDef;
  }, [nodeStack, getNode]);

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
            <DialogTitle className="text-xl font-bold text-center">Viewing: {chipDef?.data.name}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="rounded-2xl overflow-hidden h-full w-full flex-1">
          <ReactFlowProvider>
            <Circuit initialCircuit={chipDef?.data} viewOnly={true} withBackground={false} showTitle={false} />
          </ReactFlowProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
