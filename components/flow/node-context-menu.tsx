import { Edge, type Node, useReactFlow } from "@xyflow/react";
import React, { useCallback, useRef } from "react";

import { CircuitChip, Wire } from "@/lib/types/chips";
import { cn, generateId } from "@/lib/utils";

import { useRenameDialogStore } from "./rename-dialog-store";

type NodeContextMenuProps = {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onClose: () => void;
};

export function NodeContextMenu({ id, top, left, right, bottom, onClose, ...props }: NodeContextMenuProps) {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const { openDialog } = useRenameDialogStore();

  const node = getNode(id);
  const menuRef = useRef<HTMLDivElement>(null);

  const duplicateNode = useCallback(() => {
    const position = {
      x: (node?.position.x ?? 0) + 50,
      y: (node?.position.y ?? 0) + 50,
    };

    const newId = generateId();
    let newName = node?.data.name;

    if (node?.type === "in") {
      newName = `IN-${newId.slice(0, 3)}`;
    } else if (node?.type === "out") {
      newName = `OUT-${newId.slice(0, 3)}`;
    }

    addNodes({
      ...(node as Node<CircuitChip>),
      data: {
        ...node?.data,
        id: newId,
        name: newName ?? "",
        chips: node?.data.chips ?? [],
        wires: node?.data.wires ?? [],
        ports: node?.data.ports ?? [],
        definitions: node?.data.definitions ?? [],
      },
      selected: false,
      dragging: false,
      id: newId,
      position,
    });
    onClose(); // Close menu after action
  }, [id, node, addNodes, onClose]);

  const renameNode = useCallback(() => {
    if (node?.data?.name) {
      openDialog(id, node.data.name);
    }
    onClose(); // Close menu after action
  }, [id, node?.data?.name, openDialog, onClose]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
    onClose(); // Close menu after action
  }, [id, setNodes, setEdges, onClose]);

  const viewNode = useCallback(() => {
    onClose(); // Close menu after action
  }, [onClose]);

  const openNode = useCallback(() => {
    onClose(); // Close menu after action
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 font-mono" onClick={onClose}>
        {/* Menu content */}
        <div
          ref={menuRef}
          className="absolute w-32 overflow-hidden bg-popover border-2 border-border rounded-lg shadow-lg p-1.5 space-y-0"
          style={{ top, left, right, bottom }}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {/* <div className="px-2 py-1 text-sm border-b-2 border-border pb-1">{node?.data.name}</div> */}
          <div className="w-full text-left px-2 py-1.5 text-sm rounded-md font-bold" onClick={viewNode}>
            {node?.data.name}
          </div>
          {node?.type == "in" || node?.type == "out" ? (
            <>
              <NodeContextMenuButton onClick={renameNode}>Rename</NodeContextMenuButton>
              <NodeContextMenuButton onClick={duplicateNode}>Duplicate</NodeContextMenuButton>
              <NodeContextMenuButton onClick={deleteNode} variant="destructive">
                Delete
              </NodeContextMenuButton>
            </>
          ) : (
            <>
              <NodeContextMenuButton onClick={viewNode}>View</NodeContextMenuButton>
              <NodeContextMenuButton onClick={openNode}>Open</NodeContextMenuButton>
              <NodeContextMenuButton onClick={duplicateNode}>Duplicate</NodeContextMenuButton>
              <NodeContextMenuButton onClick={deleteNode} variant="destructive">
                Delete
              </NodeContextMenuButton>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function NodeContextMenuButton({
  children,
  onClick,
  className,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors",
        className,
        variant === "destructive" && "text-destructive hover:bg-destructive/10",
      )}
    >
      {children}
    </button>
  );
}
