"use client";

import {
  addEdge,
  Background,
  Connection,
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
import React, { useCallback, useEffect, useRef, useState } from "react";

import { circuitToFlow } from "@/lib/flow-utils";
import { CircuitChip, NodeType, type Wire } from "@/lib/types/chips";
import { generateId } from "@/lib/utils";

import { ChipNode, ConnectionLine, InNode, OutNode, RenamePortDialog, SaveChipDialog, WireEdge } from ".";
import { CircuitMenu } from "./circuit-menu";
import { useChips, useDnd } from "./flow-store";
import { NodeContextMenu } from "./node-context-menu";
import { Button, useSidebar } from "../ui";

const nodeTypes = { [NodeType.CHIP]: ChipNode, [NodeType.IN]: InNode, [NodeType.OUT]: OutNode };
const edgeTypes = { wire: WireEdge };

export function Circuit({ initialCircuit }: { initialCircuit?: CircuitChip | null }) {
  const { getChip } = useChips();
  // console.log("initialCircuit", initialCircuit);
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CircuitChip>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<Wire>>([]);
  const { droppedName } = useDnd();

  useEffect(() => {
    if (initialCircuit) {
      const { nodes, edges } = circuitToFlow(initialCircuit);
      setNodes(nodes);
      setEdges(edges);
      fitView();
    }
  }, [initialCircuit]);

  console.log("nodes", nodes);
  console.log("edges", edges);

  const { screenToFlowPosition } = useReactFlow();
  const ref = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{
    id: string;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  } | null>(null);

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

      const chipDef = getChip(droppedName);

      if (!chipDef) {
        return;
      }

      const type: NodeType =
        chipDef.type === NodeType.IN ? NodeType.IN : chipDef.type === NodeType.OUT ? NodeType.OUT : NodeType.CHIP;

      let name = droppedName;
      if (type === NodeType.IN) {
        name = `IN-${id.slice(0, 3)}`;
      } else if (type === NodeType.OUT) {
        name = `OUT-${id.slice(0, 3)}`;
      }

      const newNode: Node<CircuitChip> = {
        id,
        position,
        type,
        data: {
          id,
          name,
          chips: chipDef.chips,
          wires: chipDef.wires,
          ports: chipDef.ports,
          definitions: chipDef.definitions,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, droppedName],
  );

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent<Element>, node: Node<CircuitChip>) => {
      // Prevent native context menu from showing
      e.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current?.getBoundingClientRect();
      if (!pane) return;

      setMenu({
        id: node.id,
        top: e.clientY < pane.height - 100 ? e.clientY : undefined,
        left: e.clientX < pane.width - 100 ? e.clientX : undefined,
        right: e.clientX >= pane.width - 100 ? 200 : undefined,
        bottom: e.clientY >= pane.height - 100 ? 200 : undefined,
      });

      // select the nodee
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
    },
    [setMenu],
  );

  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => {
    console.log("onPaneClick");
    setMenu(null);
  }, [setMenu]);

  return (
    <div className="h-screen font-mono">
      <ReactFlow
        ref={ref}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={{
          type: "wire",
          interactionWidth: 10,
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionLineComponent={ConnectionLine}
        onNodeContextMenu={onNodeContextMenu}
        colorMode="dark"
      >
        <Background gap={10} />
        {menu && <NodeContextMenu onClose={onPaneClick} {...menu} />}
        <Controls />
        <Panel position="top-left">
          <CircuitMenu />
        </Panel>
        <Panel position="top-center">
          <h1 className="font-mono font-bold py-2 text-lg">{initialCircuit?.name ?? "CHIP"}</h1>
        </Panel>
        <Panel position="center-left">
          <FlowSidebarTrigger />
        </Panel>
        <RenamePortDialog />
        <SaveChipDialog />
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
