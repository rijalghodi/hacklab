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

import { CircuitChip, type Wire } from "@/lib/types/chips";
import { generateId } from "@/lib/utils";

import { ChipNode, ConnectionLine, InNode, OutNode, SaveChipDialog, WireEdge } from ".";
import { useChips, useDnd, useFlowStore } from "./flow-store";
import { Button, useSidebar } from "../ui";

const nodeTypes = { chip: ChipNode, in: InNode, out: OutNode };
const edgeTypes = { wire: WireEdge };

export function Circuit() {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();

  const { screenToFlowPosition } = useReactFlow();
  const { droppedName } = useDnd();
  const getChip = useChips((state) => state.getChip);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<CircuitChip>>[]) =>
      setNodes((nodesSnapshot: Node<CircuitChip>[]) => applyNodeChanges<Node<CircuitChip>>(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge<Wire>>[]) =>
      setEdges((edgesSnapshot: Edge<Wire>[]) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback((params: Connection) => {
    console.log(params);
    const id = generateId();
    setEdges((edgesSnapshot: Edge<Wire>[]) =>
      addEdge(
        {
          ...params,
          id,
          data: {
            id,
            targetId: params.target,
            targetPortId: params.targetHandle ?? undefined,
            sourceId: params.source,
            sourcePortId: params.sourceHandle ?? undefined,
            // positionHandlers: [],
          },
        },
        edgesSnapshot,
      ),
    );
  }, []);

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

      const id = generateId();

      const CHIP_DEFINITION = getChip(droppedName);

      if (!CHIP_DEFINITION) {
        return;
      }

      const type = CHIP_DEFINITION.name === "IN" ? "in" : CHIP_DEFINITION.name === "OUT" ? "out" : "chip";

      const newNode: Node<CircuitChip> = {
        id,
        position,
        type,
        data: {
          id,
          name: CHIP_DEFINITION.name,
          chips: CHIP_DEFINITION.chips || [],
          wires: CHIP_DEFINITION.wires || [],
          ports: CHIP_DEFINITION.ports || [],
          definitions: CHIP_DEFINITION.definitions || [],
        },
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
        <Panel position="top-right">
          <h1 className="text-foreground">
            <SaveChipDialog>
              <Button variant="outline" size="sm">
                Save Chip
              </Button>
            </SaveChipDialog>
          </h1>
        </Panel>
        <Panel position="top-center">
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
