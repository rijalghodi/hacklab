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
  Panel,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback } from "react";

import { builtInChips, builtInPorts } from "@/lib/constants/chips";
import { Chip, Wire } from "@/lib/types/flow";

import { ChipNode } from "./chip-node";
import { ConnectionLine } from "./connection-line";
import { useDnd, useFlowStore } from "./flow-store";
import { PortNode } from "./port-node";
import { WireEdge } from "./wire-edge";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

const nodeTypes = { chip: ChipNode, port: PortNode };
const edgeTypes = { wire: WireEdge };

export function Circuit() {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();

  const { screenToFlowPosition } = useReactFlow();
  const { droppedName } = useDnd();

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<Chip>>[]) =>
      setNodes((nodesSnapshot: Node<Chip>[]) => applyNodeChanges<Node<Chip>>(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge<Wire>>[]) =>
      setEdges((edgesSnapshot: Edge<Wire>[]) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot: Edge<Wire>[]) => addEdge(params, edgesSnapshot)),
    [],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!droppedName) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = crypto.randomUUID();

      const port = builtInPorts.find((port) => port.name === droppedName);

      const chip = builtInChips.find((chip) => chip.name === droppedName);

      if (!chip && !port) {
        return;
      }

      const newNode: Node<Chip> = {
        id,
        type: chip ? "chip" : "port",
        position,
        data: { id, name: droppedName, ...chip, ...port },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, droppedName],
  );

  return (
    <div className="h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // onConnectEnd={handleConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={{
          type: "wire",
          interactionWidth: 10,
        }}
        // snapGrid={[5, 5]}
        // snapToGrid={true}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionLineComponent={ConnectionLine}
        colorMode="dark"
      >
        <Background gap={10} />
        <MiniMap />
        <Controls />
        <Panel position="top-left">
          <h1 className="text-foreground">My Flow</h1>
        </Panel>
        <Panel position="center-left">
          <FlowSidebarTrigger />
        </Panel>
      </ReactFlow>
    </div>
  );
}

function FlowSidebarTrigger() {
  const { toggleSidebar, open } = useSidebar();
  return (
    <Button className="h-12 w-7" variant="ghost" size="icon" onClick={toggleSidebar} title="Toggle Sidebar">
      {open ? <ChevronLeft className="size-6" /> : <ChevronRight className="size-6" />}
    </Button>
  );
}
