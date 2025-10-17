import { Edge, type Node, useReactFlow } from "@xyflow/react";
import React, { useCallback } from "react";

import { CircuitChip, NAND_NAME, NodeType, Wire } from "@/lib/types/chips";
import { generateId } from "@/lib/utils";
import { useRenamePortDialogStore } from "@/hooks";
import { useViewChipDialogStore } from "@/hooks/use-view-chip-dialog-store";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type NodeContextMenuProps = {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onClose: () => void;
};

export function NodeContextMenu({ id, top, left, right, bottom, onClose }: NodeContextMenuProps) {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const { openDialog } = useRenamePortDialogStore();
  const { viewChip } = useViewChipDialogStore();

  const node = getNode(id);

  const duplicateNode = useCallback(() => {
    const position = {
      x: (node?.position.x ?? 0) + 50,
      y: (node?.position.y ?? 0) + 50,
    };

    const newId = generateId();
    let newName = node?.data.name;

    if (node?.type === NodeType.IN) {
      newName = "IN";
    } else if (node?.type === NodeType.OUT) {
      newName = "OUT";
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
  }, [id, node, addNodes]);

  const renameNode = useCallback(() => {
    if (node?.data?.name) {
      openDialog(id, node.data.name);
    }
  }, [id, node?.data?.name, openDialog]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
  }, [id, setNodes, setEdges]);

  const viewNode = useCallback(() => {
    viewChip(node?.data.name ?? "");
  }, [node?.data.name, viewChip]);

  const openNode = useCallback(() => {}, []);

  if (!node) return null;

  const isNand = node?.data.name === NAND_NAME;
  const isIn = node?.type === NodeType.IN;
  const isOut = node?.type === NodeType.OUT;

  return (
    <DropdownMenu open={!!id} onOpenChange={onClose}>
      <DropdownMenuTrigger className="sr-only fixed" title="Node Context Menu" style={{ top, left, right, bottom }} />
      <DropdownMenuContent align="start" className="font-mono font-semibold uppercase">
        <DropdownMenuLabel>{node?.data.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isIn || isOut ? (
          <>
            <DropdownMenuItem onClick={renameNode}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={duplicateNode}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={deleteNode} variant="destructive">
              Delete
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {!isNand && (
              <>
                <DropdownMenuItem onClick={viewNode}>View</DropdownMenuItem>
                <DropdownMenuItem onClick={openNode}>Open</DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={duplicateNode}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={openNode}>Open Chip</DropdownMenuItem>
            <DropdownMenuItem onClick={deleteNode} variant="destructive">
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
