"use client";

import { Edge, Node, useEdges, useNodes, useReactFlow } from "@xyflow/react";
import { isEqual } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { flowToCircuit, getSavedChipFromLocalStorage } from "@/lib/flow-utils";
import { CircuitChip, Wire } from "@/lib/types/chips";

import { useConfirmDialogStore } from "./confirm-dialog-store";

export const isChipIdEmpty = (chipId: string | null | undefined) => chipId === "new" || chipId === "";

export function useCircuitPageParams() {
  const router = useRouter();
  const { chipId: chipIdParam } = useParams<{ chipId: string }>();
  const chipId = chipIdParam === "new" ? null : chipIdParam;
  const { openDialog } = useConfirmDialogStore();
  const nodes = useNodes<Node<CircuitChip>>();
  const edges = useEdges<Edge<Wire>>();
  const { setEdges, setNodes } = useReactFlow();

  const hasUnsavedChanges = useMemo(() => {
    if (chipId) {
      const saved = getSavedChipFromLocalStorage(chipId);
      const current = flowToCircuit(nodes, edges);
      const savedEssential = {
        chips: saved?.chips,
        wires: saved?.wires,
        ports: saved?.ports,
      };
      return !isEqual(savedEssential, current);
    }
    return nodes.length > 0 || edges.length > 0;
  }, [chipId, nodes, edges]);

  function setChipId(newChipId: string | null | undefined) {
    if (!hasUnsavedChanges) {
      newChipId = !newChipId ? "new" : newChipId;
      router.push(`/chips/${newChipId}`);
      return;
    }

    openDialog({
      title: "Unsaved Changes",
      description: "You have unsaved changes that will be lost. Are you sure you want to continue?",
      confirmText: "Continue",
      cancelText: "Stay Here",
      variant: "destructive",
      onConfirm: () => {
        if (!newChipId) {
          setEdges([]);
          setNodes([]);
        }
        router.push(`/chips/${newChipId}`);
      },
    });
  }

  return { chipId, setChipId };
}
