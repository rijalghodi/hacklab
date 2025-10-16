"use client";

import { Edge, Node, useEdges, useNodes } from "@xyflow/react";
import { isEqual } from "lodash";
import { useParams, useRouter } from "next/navigation";

import { flowToCircuit, getSavedChipFromLocalStorage } from "@/lib/flow-utils";
import { CircuitChip, Wire } from "@/lib/types/chips";

import { useConfirmDialogStore } from "./confirm-dialog-store";

export function useCircuitPageParams() {
  const router = useRouter();
  const { chipId: chipIdParam } = useParams<{ chipId: string }>();
  const chipId = chipIdParam === "new" ? null : chipIdParam;
  const { openDialog } = useConfirmDialogStore();
  const nodes = useNodes<Node<CircuitChip>>();
  const edges = useEdges<Edge<Wire>>();

  function setChipId(newChipId: string | null | undefined) {
    if (!chipId) return router.push(`/chips/new`);

    const saved = getSavedChipFromLocalStorage(chipId);
    const current = flowToCircuit(nodes, edges);

    const savedEssential = {
      chips: saved?.chips,
      wires: saved?.wires,
      ports: saved?.ports,
    };

    if (isEqual(savedEssential, current)) return router.push(`/chips/${newChipId}`);

    if (!newChipId) return router.push(`/chips/new`);

    openDialog({
      title: "Unsaved Changes",
      description: "You have unsaved changes that will be lost. Are you sure you want to continue?",
      confirmText: "Continue",
      cancelText: "Stay Here",
      variant: "destructive",
      onConfirm: () => router.push(`/chips/${newChipId}`),
    });
  }

  return { chipId, setChipId };
}
