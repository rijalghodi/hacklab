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
  Panel,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useState } from "react";

import { builtInChips } from "@/lib/constants/chips";
import { Chip, Wire } from "@/lib/types/flow";

import { ChipNode } from "./chip-node";
import { ConnectionLine } from "./connection-line";
import { useCircuit, useDnd } from "./flow-store";
import { WireEdge } from "./wire-edge";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

const nodeTypes = { chip: ChipNode };
const edgeTypes = { wire: WireEdge };

export function Circuit() {
  const { chips: nodes, wires: edges, setChips: setNodes, setWires: setEdges } = useCircuit();

  const { screenToFlowPosition } = useReactFlow();
  const { type } = useDnd();

  const handleConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      if (connectionState.isValid) return;

      const sourceNodeId = connectionState.fromNode?.id ?? "0";

      const id = crypto.randomUUID();
      const { clientX, clientY } = "changedTouches" in event ? event.changedTouches[0] : event;

      const newNode: Node<Chip> = {
        id,
        data: {
          id,
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

      setNodes((nodes) => [...nodes, newNode]);
      setEdges([
        ...edges,
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

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = crypto.randomUUID();

      const chip = builtInChips.find((chip) => chip.name === type);

      if (!chip) {
        return;
      }

      const newNode: Node<Chip> = {
        id,
        type: "chip",
        position,
        data: { id, ...chip },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type],
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
