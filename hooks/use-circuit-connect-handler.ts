import { type Connection, type Edge, type Node, useReactFlow } from "@xyflow/react";
import { addEdge } from "@xyflow/react";
import { useCallback } from "react";

import { CircuitChip, NodeType, Wire } from "@/lib/types/chips";
import { generateId } from "@/lib/utils";

export function useCircuitConnectHandler() {
  const { getNode } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const onConnect = useCallback(
    (params: Connection, setEdges: (updater: (edges: Edge<Wire>[]) => Edge<Wire>[]) => void) => {
      console.log("onConnect", params);
      const id = generateId();

      setEdges((edgesSnapshot: Edge<Wire>[]) => {
        let targetPortId = params.targetHandle;
        let sourcePortId = params.sourceHandle;

        const sourceNode = getNode(params.source);
        console.log("sourceNode", sourceNode);
        if (sourceNode?.type === NodeType.IN) {
          sourcePortId = params.source;
        }

        const targetNode = getNode(params.target);
        console.log("targetNode", targetNode);
        if (targetNode?.type === NodeType.OUT) {
          targetPortId = params.target;
        }

        return addEdge(
          {
            id,
            source: params.source,
            target: params.target,
            sourceHandle: sourcePortId,
            targetHandle: targetPortId,
            data: {
              id,
              targetId: params.target,
              targetPortId,
              sourceId: params.source,
              sourcePortId,
            },
          },
          edgesSnapshot,
        );
      });
    },
    [getNode],
  );

  return { onConnect };
}
