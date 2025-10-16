"use client";

import {
  Background,
  Controls,
  type Edge,
  type Node,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect } from "react";

import { circuitToFlow } from "@/lib/flow-utils";
import { CircuitChip, NodeType, type Wire } from "@/lib/types/chips";
import { useConnectionHandler, useContextMenu, useDragAndDrop } from "@/hooks";

import { ChipNode, ConnectionLine, InNode, OutNode, RenamePortDialog, SaveChipDialog, WireEdge } from ".";
import { CircuitMenu } from "./circuit-menu";
import { useChips, useDnd } from "./flow-store";
import { NodeContextMenu } from "./node-context-menu";
import { Button, ConfirmDialog, useSidebar } from "../ui";

const nodeTypes = { [NodeType.CHIP]: ChipNode, [NodeType.IN]: InNode, [NodeType.OUT]: OutNode };
const edgeTypes = { wire: WireEdge };

export function Circuit({ initialCircuit }: { initialCircuit?: CircuitChip | null }) {
  const { getChip } = useChips();
  const { fitView, getNode, screenToFlowPosition } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CircuitChip>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<Wire>>([]);
  const { droppedName } = useDnd();

  // Custom hooks for different functionalities
  const { ref, menu, onNodeContextMenu, onPaneClick } = useContextMenu();
  const { onConnect } = useConnectionHandler(getNode);
  const { onDragOver, onDrop } = useDragAndDrop(droppedName, getChip, screenToFlowPosition);

  useEffect(() => {
    if (initialCircuit) {
      const { nodes, edges } = circuitToFlow(initialCircuit);
      setNodes(nodes);
      setEdges(edges);
      fitView();
    }
  }, [initialCircuit]);

  return (
    <div className="h-screen font-mono">
      <ReactFlow
        ref={ref}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => onConnect(params, setEdges)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={{
          type: "wire",
          interactionWidth: 10,
        }}
        onDrop={(event) => onDrop(event, setNodes)}
        onDragOver={onDragOver}
        connectionLineComponent={ConnectionLine}
        onNodeContextMenu={(e, node) => onNodeContextMenu(e, node, setNodes)}
        colorMode="dark"
      >
        <Background gap={10} />
        {menu && <NodeContextMenu onClose={onPaneClick} {...menu} />}
        <Controls />
        <Panel position="top-left">
          <CircuitMenu />
        </Panel>
        <Panel position="top-center">
          <h1 className="font-mono font-bold py-2 text-lg">{initialCircuit?.name ?? "New Chip"}</h1>
        </Panel>
        <Panel position="center-left">
          <FlowSidebarTrigger />
        </Panel>
        <RenamePortDialog />
        <SaveChipDialog />
        <ConfirmDialog />
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
