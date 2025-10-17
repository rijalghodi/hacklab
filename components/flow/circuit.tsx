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
} from "@xyflow/react";
import React, { useEffect } from "react";

import { circuitToFlow } from "@/lib/flow-utils";
import { CircuitChip, NodeType, type Wire } from "@/lib/types/chips";
import { useCircuitConnectHandler, useCircuitDndHandler, useContextMenu } from "@/hooks";

import {
  ChipNode,
  CircuitMenu,
  ConnectionLine,
  InNode,
  NodeContextMenu,
  OutNode,
  RenamePortDialog,
  SaveChipDialog,
  ViewChipDialog,
  WireEdge,
} from ".";
import { ConfirmDialog } from "../ui";

export const nodeTypes = { [NodeType.CHIP]: ChipNode, [NodeType.IN]: InNode, [NodeType.OUT]: OutNode };
export const edgeTypes = { wire: WireEdge };

export function Circuit({
  initialCircuit,
  viewOnly = false,
  withBackground = true,
  showTitle = true,
  showControls = true,
  elementsSelectable = true,
  nodesDraggable = true,
  zoomOnScroll = true,
  contextMenuEnabled = true,
  style = {},
  isFitView = false,
  minZoom = 1,
  maxZoom = 6,
  defaultZoom = 2,
}: {
  initialCircuit?: CircuitChip | null;
  viewOnly?: boolean;
  withBackground?: boolean;
  showTitle?: boolean;
  showControls?: boolean;
  elementsSelectable?: boolean;
  nodesDraggable?: boolean;
  zoomOnScroll?: boolean;
  contextMenuEnabled?: boolean;
  style?: React.CSSProperties;
  isFitView?: boolean;
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CircuitChip>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<Wire>>([]);

  const { ref, menu, onNodeContextMenu, onPaneClick } = useContextMenu();
  const { onConnect } = useCircuitConnectHandler();
  const { onDragOver, onDrop } = useCircuitDndHandler();

  useEffect(() => {
    if (initialCircuit) {
      const { nodes, edges } = circuitToFlow(initialCircuit);
      setNodes(nodes);
      setEdges(edges);
    }
  }, [initialCircuit]);

  return (
    <div className="h-full w-full font-mono">
      <ReactFlow
        ref={ref}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => onConnect(params, setEdges)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={isFitView}
        defaultEdgeOptions={{
          type: "wire",
          interactionWidth: 10,
        }}
        onDrop={(event) => onDrop(event, setNodes)}
        onDragOver={onDragOver}
        connectionLineComponent={ConnectionLine}
        onNodeContextMenu={contextMenuEnabled ? (e, node) => onNodeContextMenu(e, node, setNodes) : undefined}
        colorMode="dark"
        maxZoom={maxZoom}
        minZoom={minZoom}
        defaultViewport={{ x: 0, y: 0, zoom: defaultZoom }}
        panOnDrag={false}
        elementsSelectable={elementsSelectable}
        nodesDraggable={nodesDraggable}
        zoomOnScroll={zoomOnScroll}
        style={style}
      >
        {withBackground && <Background gap={10} />}
        {menu && contextMenuEnabled && <NodeContextMenu onClose={onPaneClick} {...menu} viewOnly={viewOnly} />}
        {showControls && <Controls />}

        {showTitle && (
          <Panel position="top-center">
            <h1 className="font-mono font-bold py-2 text-lg">{initialCircuit?.name ?? "New Chip"}</h1>
          </Panel>
        )}

        {!viewOnly && (
          <>
            <Panel position="top-left">
              <CircuitMenu />
            </Panel>
            <RenamePortDialog />
            <SaveChipDialog />
            <ConfirmDialog />
          </>
        )}
      </ReactFlow>
      {!viewOnly && <ViewChipDialog />}
    </div>
  );
}
