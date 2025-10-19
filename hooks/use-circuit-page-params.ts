"use client";

import { Edge, Node, useEdges, useNodes, useReactFlow } from "@xyflow/react";
import { isEqual } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { flowToCircuit, getSavedChipFromLocalStorage } from "@/lib/flow-utils";
import { CircuitChip, Wire } from "@/lib/types/chips";

import { useConfirmDialogStore } from "./confirm-dialog-store";

export const isChipTypeEmpty = (chipType: string | null | undefined) => chipType === "new" || chipType === "";

export function useCircuitPageParams() {
  const router = useRouter();
  const { chipType: chipTypeParam } = useParams<{ chipType: string }>();
  const chipType = chipTypeParam === "new" ? null : chipTypeParam;
  const { openDialog } = useConfirmDialogStore();
  const nodes = useNodes<Node<CircuitChip>>();
  const edges = useEdges<Edge<Wire>>();
  const { setEdges, setNodes } = useReactFlow();

  const hasUnsavedChanges = useMemo(() => {
    if (chipType) {
      const saved = getSavedChipFromLocalStorage(chipType);
      const current = flowToCircuit(nodes, edges);
      const savedEssential = {
        chips: saved?.chips,
        wires: saved?.wires,
        ports: saved?.ports,
      };
      return !isEqual(savedEssential, current);
    }
    return nodes.length > 0 || edges.length > 0;
  }, [chipType, nodes, edges]);

  function navigateToChipNoConfirm(newChipType: string | null | undefined) {
    if (!newChipType) {
      setEdges([]);
      setNodes([]);
    }
    router.push(`/chips/${newChipType}`);
  }

  function navigateToChip(newChipType: string | null | undefined) {
    if (!hasUnsavedChanges) {
      newChipType = !newChipType ? "new" : newChipType;
      router.push(`/chips/${newChipType}`);
      return;
    }

    openDialog({
      title: "Unsaved Changes",
      description: "You have unsaved changes that will be lost. Are you sure you want to continue?",
      confirmText: "Continue",
      cancelText: "Stay Here",
      variant: "destructive",
      onConfirm: () => {
        if (!newChipType) {
          setEdges([]);
          setNodes([]);
        }
        router.push(`/chips/${newChipType}`);
      },
    });
  }

  return { chipType, navigateToChip, navigateToChipNoConfirm };
}
