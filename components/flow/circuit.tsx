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
  type Node,
  NodeChange,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

import { CircuitChip, type Wire } from "@/lib/types/chips";
import { generateId } from "@/lib/utils";

import { ChipNode, ConnectionLine, InNode, OutNode, RenamePortDialog, SaveChipDialog, WireEdge } from ".";
import { useChips, useDnd } from "./flow-store";
import { NodeContextMenu } from "./node-context-menu";
import { Button, useSidebar } from "../ui";
import { Menu } from "./menu";

const nodeTypes = { chip: ChipNode, in: InNode, out: OutNode };
const edgeTypes = { wire: WireEdge };

export function Circuit() {
  // const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CircuitChip>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<Wire>>([]);

  const { screenToFlowPosition } = useReactFlow();
  const ref = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ id: string; top?: number; left?: number; right?: number; bottom?: number } | null>(
    null,
  );
  const { droppedName } = useDnd();
  const getChip = useChips((state) => state.getChip);

  // const onNodesChange = useCallback(
  //   (changes: NodeChange<Node<CircuitChip>>[]) =>
  //     setNodes((nodesSnapshot: Node<CircuitChip>[]) => applyNodeChanges<Node<CircuitChip>>(changes, nodesSnapshot)),
  //   [],
  // );
  // const onEdgesChange = useCallback(
  //   (changes: EdgeChange<Edge<Wire>>[]) =>
  //     setEdges((edgesSnapshot: Edge<Wire>[]) => applyEdgeChanges(changes, edgesSnapshot)),
  //   [],
  // );

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

      let name = droppedName;
      if (name === "IN") {
        name = `IN-${id.slice(0, 3)}`;
      } else if (name === "OUT") {
        name = `OUT-${id.slice(0, 3)}`;
      }

      const newNode: Node<CircuitChip> = {
        id,
        position,
        type,
        data: {
          id,
          name,
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

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent<Element>, node: Node<CircuitChip>) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current?.getBoundingClientRect();
      if (!pane) return;

      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 50 ? event.clientY : undefined,
        left: event.clientX < pane.width - 50 ? event.clientX : undefined,
        right: event.clientX >= pane.width - 50 ? 50 : undefined,
        bottom: event.clientY >= pane.height - 50 ? 50 : undefined,
      });

      // select the nodee
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
    },
    [setMenu],
  );

  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

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
          <Menu />
        </Panel>
        <Panel position="top-center">
          <h1 className="text-foreground">My Flow</h1>
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
