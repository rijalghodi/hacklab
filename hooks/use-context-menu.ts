"use client";

import type { Node } from "@xyflow/react";
import { useCallback, useRef, useState } from "react";

import { CircuitChip } from "@/lib/types/chips";

export interface ContextMenuState {
  id: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export function useContextMenu() {
  const ref = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  const onNodeContextMenu = useCallback(
    (
      e: React.MouseEvent<Element>,
      node: Node<CircuitChip>,
      setNodes: (updater: (nodes: Node<CircuitChip>[]) => Node<CircuitChip>[]) => void,
    ) => {
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

      // select the node
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
    },
    [setMenu],
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
  }, [setMenu]);

  return {
    ref,
    menu,
    onNodeContextMenu,
    onPaneClick,
  };
}
