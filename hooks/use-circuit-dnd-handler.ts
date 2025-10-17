import { type Edge, type Node,useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

import { createNodeFromChip } from "@/lib/circuit-node-utils";
import { CircuitChip, Wire } from "@/lib/types/chips";

import { useChips } from "./use-chips-store";
import { useDnd } from "./use-dnd-store";

export function useCircuitDndHandler() {
  // droppedName: string,
  // getChip: (name: string) => CircuitChip | null,
  // screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number },
  const { screenToFlowPosition } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const { getChip } = useChips();
  const { droppedName } = useDnd();

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
    [droppedName],
  );

  return { onDragOver, onDrop };
}
