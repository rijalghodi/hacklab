"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  type Edge,
  EdgeChange,
  MiniMap,
  type Node,
  NodeChange,
  type OnConnectEnd,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback, useState } from "react";

import { Chip } from "@/lib/types/flow";

import { ChipNode } from "./chip-node";
import { ConnectionLine } from "./connection-line";
import { WireEdge } from "./wire-edge";

const nodeTypes = { chip: ChipNode };
const edgeTypes = { wire: WireEdge };

const initialNodes: Node<Chip>[] = [
  {
    id: "0",
    position: { x: 0, y: 100 },
    data: {
      id: "0",
      name: "ABC",
      ports: [
        { id: "in", name: "in", type: "input" },
        { id: "out", name: "out", type: "output" },
      ],
    },
    type: "chip",
  },
];

const initialEdges: Edge[] = [
  // {
  //   id: 'e1-2',
  //   source: '0',
  //   target: '2',
  //   type: 'smoothstep',
  //   label: 'to'
  //   // style: 'stroke: #f00; stroke-dasharray: 5 5;'
  // }
];

export function Circuit() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  const handleConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      if (connectionState.isValid) return;

      const sourceNodeId = connectionState.fromNode?.id ?? "0";

      const id = crypto.randomUUID();
      const { clientX, clientY } = "changedTouches" in event ? event.changedTouches[0] : event;

      const newNode: Node = {
        id,
        data: {
          name: `Node ${id.slice(0, 3)}`,
          ports: [
            { id: "in", name: "in", type: "input" },
            { id: "out", name: "out", type: "output" },
            { id: "clk", name: "clk", type: "input" },
          ],
        },
        // project the screen coordinates to pane coordinates
        position: screenToFlowPosition({
          x: clientX,
          y: clientY,
        }),
        // set the origin of the new node so it is centered
        origin: [0.0, 0.5],
        type: "chip",
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [
        ...eds,
        {
          source: sourceNodeId,
          target: id,
          id: `${sourceNodeId}--${id}`,
          type: "wire",
        },
      ]);
    },
    [screenToFlowPosition],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div className="h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={handleConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={{
          type: "wire",
          interactionWidth: 10,
        }}
        snapGrid={[5, 5]}
        snapToGrid={true}
        connectionLineComponent={ConnectionLine}
      >
        {/* <Background gap={5} /> */}
        <MiniMap />
        <Controls />
        {/* <Panel position="top-left">
          <h1 className="text-foreground">My Flow</h1>
        </Panel> */}
      </ReactFlow>
    </div>
  );
}
