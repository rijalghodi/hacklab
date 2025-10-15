import type { Node } from "@xyflow/react";
import { useCallback } from "react";

import { createNodeFromChip } from "@/lib/circuit-node-utils";
import { CircuitChip } from "@/lib/types/chips";

export function useDragAndDrop(
  droppedName: string,
  getChip: (name: string) => CircuitChip | undefined,
  screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number },
) {
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (
      event: React.DragEvent<HTMLDivElement>,
      setNodes: (updater: (nodes: Node<CircuitChip>[]) => Node<CircuitChip>[]) => void,
    ) => {
      event.preventDefault();

      if (!droppedName) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const chipDef = getChip(droppedName);

      if (!chipDef) {
        return;
      }

      const newNode = createNodeFromChip({ chipDef, position, droppedName });
      setNodes((nds) => nds.concat(newNode));
    },
    [droppedName, getChip, screenToFlowPosition],
  );

  return { onDragOver, onDrop };
}
