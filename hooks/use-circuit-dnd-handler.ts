import { type Edge, type Node, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";

import { createNodeFromChip } from "@/lib/circuit-node-utils";
import { logger } from "@/lib/logger";
import { CircuitChip, Wire } from "@/lib/types/chips";

import { useDndStore } from "./use-dnd-store";

export function useCircuitDndHandler() {
  // droppedName: string,
  // getChip: (name: string) => CircuitChip | null,
  // screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number },
  const { screenToFlowPosition, setNodes } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const { dropped, setDropped } = useDndStore();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      logger.debug({ group: "useCircuitDndHandler", message: `onDrop: dropped=${dropped}`, data: { event } });
      try {
        event.preventDefault();

        if (!dropped) {
          return;
        }

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode = await createNodeFromChip({ chipType: dropped, position });
        setNodes((nds) => nds.concat(newNode));
        setDropped(null);
      } catch (error) {
        toast.error("Failed to create node: " + (error as Error).message);
      }
    },
    [dropped],
  );

  return { onDragOver, onDrop };
}
