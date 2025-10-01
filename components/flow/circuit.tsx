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

import { NodeType, StatefulChip, StatefulPort, StatefulWire } from "@/lib/types/flow";
import { generateId } from "@/lib/utils";

import { ChipNode, ConnectionLine, InNode, OutNode, WireEdge } from ".";
import { useChips, useDnd, useFlowStore } from "./flow-store";
import { Button, useSidebar } from "../ui";

const nodeTypes = { [NodeType.CHIP]: ChipNode, [NodeType.IN]: InNode, [NodeType.OUT]: OutNode };
const edgeTypes = { wire: WireEdge };

export function Circuit() {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();

  const { screenToFlowPosition } = useReactFlow();
  const { droppedName } = useDnd();
  const getChip = useChips((state) => state.getChip);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<StatefulChip>>[]) =>
      setNodes((nodesSnapshot: Node<StatefulChip>[]) => applyNodeChanges<Node<StatefulChip>>(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge<StatefulWire>>[]) =>
      setEdges((edgesSnapshot: Edge<StatefulWire>[]) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback((params: Connection) => {
    console.log(params);
    const id = generateId();
    setEdges((edgesSnapshot: Edge<StatefulWire>[]) =>
      addEdge(
        {
          ...params,
          id,
          data: {
            id,
            targetId: params.target,
            targetPortId: params.targetHandle,
            sourceId: params.source,
            sourcePortId: params.sourceHandle,
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

      const newNode: Node<StatefulChip> = {
        id,
        type: CHIP_DEFINITION.type,
        position,
        data: {
          id,
          type: CHIP_DEFINITION.type,
          name: CHIP_DEFINITION.name,
          ports: CHIP_DEFINITION.nodes
            ?.filter((node) => node.type === NodeType.IN || node.type === NodeType.OUT)
            .map((node) => ({ id: node.id, type: node.type, name: node.name })) as StatefulPort[],
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
