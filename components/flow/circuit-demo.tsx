"use client";

import { type Edge, type Node, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import React from "react";

import { CircuitChip, NodeType, PortType, type Wire } from "@/lib/types/chips";

import { edgeTypes, nodeTypes } from "./circuit";

const initialNodes: Node<CircuitChip>[] = [
  {
    id: "in-a",
    type: NodeType.IN,
    position: { x: 50, y: 80 },
    data: {
      id: "in-a",
      name: "IN A",
      type: NodeType.IN,
      ports: [{ id: "in-a", name: "in-a", type: PortType.OUT, value: false }],
    },
  },
  {
    id: "in-b",
    type: NodeType.IN,
    position: { x: 50, y: 120 },
    data: {
      id: "in-b",
      name: "IN B",
      type: NodeType.IN,
      ports: [{ id: "in-b", name: "in-b", type: PortType.OUT, value: false }],
    },
  },
  {
    id: "nand",
    type: NodeType.CHIP,
    position: { x: 140, y: 100 },
    data: {
      id: "nand",
      name: "NAND",
      type: NodeType.CHIP,
      ports: [
        { id: "nand-a", name: "a", type: PortType.IN },
        { id: "nand-b", name: "b", type: PortType.IN },
        { id: "nand-out", name: "out", type: PortType.OUT },
      ],
    },
  },
  {
    id: "out",
    type: NodeType.OUT,
    position: { x: 250, y: 100 },
    data: {
      id: "out",
      name: "OUT",
      type: NodeType.OUT,
      ports: [{ id: "out", name: "out", type: PortType.IN }],
    },
  },
];

const initialEdges: Edge<Wire>[] = [
  {
    id: "wire-1",
    source: "in-a",
    target: "nand",
    sourceHandle: "in-a",
    targetHandle: "nand-a",
    data: {
      id: "wire-1",
      sourceId: "in-a",
      targetId: "nand",
      sourcePortId: "in-a",
      targetPortId: "nand-a",
    },
  },
  {
    id: "wire-2",
    source: "in-b",
    target: "nand",
    sourceHandle: "in-b",
    targetHandle: "nand-b",
    data: {
      id: "wire-2",
      sourceId: "in-b",
      targetId: "nand",
      sourcePortId: "in-b",
      targetPortId: "nand-b",
    },
  },
  {
    id: "wire-3",
    source: "nand",
    target: "out",
    sourceHandle: "nand-out",
    targetHandle: "out",
    data: {
      id: "wire-3",
      sourceId: "nand",
      targetId: "out",
      sourcePortId: "nand-out",
      targetPortId: "out",
    },
  },
];

export function CircuitDemo() {
  const [nodes, _setNodes, onNodesChange] = useNodesState<Node<CircuitChip>>(initialNodes);
  const [edges, _setEdges, onEdgesChange] = useEdgesState<Edge<Wire>>(initialEdges);

  return (
    <div className="h-full w-full relative rounded-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={{
          type: "wire",
        }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        colorMode="dark"
        style={
          {
            "--xy-background-color": "transparent",
          } as React.CSSProperties
        }
      >
        {/* <Background gap={20} /> */}
      </ReactFlow>
    </div>
  );
}
