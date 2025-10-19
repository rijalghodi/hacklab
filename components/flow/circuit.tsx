"use client";

import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  type Edge,
  EdgeChange,
  type Node,
  NodeChange,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import React, { useCallback, useEffect } from "react";
import useUndoable from "use-undoable";

import { circuitToFlow } from "@/lib/flow-utils";
import { CircuitChip, NodeType, type Wire } from "@/lib/types/chips";
import { useCircuitConnectHandler, useCircuitDndHandler, useContextMenu } from "@/hooks";
import { useCircuitKeyboardShortcuts } from "@/hooks/use-circuit-keyboard-shortcuts";

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
  zoomEnabled = true,
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
  zoomEnabled?: boolean;
  contextMenuEnabled?: boolean;
  style?: React.CSSProperties;
  isFitView?: boolean;
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
}) {
  const [elements, setElements, { undo, redo, canUndo, canRedo }] = useUndoable({
    nodes: [] as Node<CircuitChip>[],
    edges: [] as Edge<Wire>[],
  });

  const triggerUpdate = useCallback(
    (t: "nodes" | "edges", v: Node<CircuitChip>[] | Edge<Wire>[]) => {
      // To prevent a mismatch of state updates,
      // we'll use the value passed into this
      // function instead of the state directly.
      setElements((e: { nodes: Node<CircuitChip>[]; edges: Edge<Wire>[] }) => {
        return {
          nodes: t === "nodes" ? (v as Node<CircuitChip>[]) : e.nodes,
          edges: t === "edges" ? (v as Edge<Wire>[]) : e.edges,
        };
      });
    },
    [setElements],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<CircuitChip>>[]) => {
      triggerUpdate("nodes", applyNodeChanges(changes, elements.nodes));
    },
    [triggerUpdate, elements.nodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge<Wire>>[]) => {
      triggerUpdate("edges", applyEdgeChanges(changes, elements.edges));
    },
    [triggerUpdate, elements.edges],
  );

  const { nodes, edges } = elements;

  const setNodes = useCallback(
    (updater: (nodes: Node<CircuitChip>[]) => Node<CircuitChip>[]) => {
      setElements((prev: { nodes: Node<CircuitChip>[]; edges: Edge<Wire>[] }) => ({
        ...prev,
        nodes: typeof updater === "function" ? updater(prev.nodes) : updater,
      }));
    },
    [setElements],
  );

  const setEdges = useCallback(
    (updater: (edges: Edge<Wire>[]) => Edge<Wire>[]) => {
      setElements((prev: { nodes: Node<CircuitChip>[]; edges: Edge<Wire>[] }) => ({
        ...prev,
        edges: typeof updater === "function" ? updater(prev.edges) : updater,
      }));
    },
    [setElements],
  );

  const { ref, menu, onNodeContextMenu, onPaneClick } = useContextMenu();
  const { onConnect } = useCircuitConnectHandler();
  const { onDragOver, onDrop } = useCircuitDndHandler();
  useCircuitKeyboardShortcuts(undo, redo);

  const handleNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node<CircuitChip>) => {
      onNodeContextMenu(e, node, setNodes);
    },
    [onNodeContextMenu, setNodes],
  );

  useEffect(() => {
    if (initialCircuit) {
      const { nodes, edges } = circuitToFlow(initialCircuit);
      setElements({ nodes, edges });
    }
  }, [initialCircuit]);

  return (
    <div className="h-full w-full font-mono dark">
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
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionLineComponent={ConnectionLine}
        onNodeContextMenu={contextMenuEnabled ? handleNodeContextMenu : undefined}
        // onNodeDragStop={(_, node) =>
        //   setElements((els) => ({
        //     ...els,
        //     nodes: els.nodes.map((e) => (e.id === node.id ? { ...e, position: node.position } : e)),
        //   }))
        // }
        /* colorMode and proOptions are not valid ReactFlow props,
           so they have been removed. */
        colorMode="dark"
        proOptions={{
          hideAttribution: true,
        }}
        maxZoom={maxZoom}
        minZoom={minZoom}
        defaultViewport={{ x: 0, y: 0, zoom: defaultZoom }}
        panOnDrag={false}
        elementsSelectable={elementsSelectable}
        nodesDraggable={nodesDraggable}
        zoomOnScroll={zoomEnabled}
        zoomOnDoubleClick={zoomEnabled}
        style={style}
      >
        {withBackground && <Background gap={10} />}
        {menu && contextMenuEnabled && <NodeContextMenu onClose={onPaneClick} {...menu} viewOnly={viewOnly} />}
        {showControls && <Controls />}

        {!viewOnly && (
          <>
            <Panel position="top-left">
              <div className="flex items-center gap-6">
                <CircuitMenu undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
                {showTitle && (
                  <h1 className="font-mono font-bold py-1 text-xl">
                    {" "}
                    {initialCircuit?.name ? `Chip: ${initialCircuit.name}` : "Untitled Chip"}
                  </h1>
                )}
              </div>
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
