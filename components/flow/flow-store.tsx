"use client";

import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { LOCAL_STORAGE_FLOW, LOCAL_STORAGE_SAVED_CHIPS } from "@/lib/constants/names";
import { Chip, CircuitModule, Wire } from "@/lib/types/flow";

interface DndStore {
  droppedName: string;
  setDroppedName: (name: string) => void;
}

export const useDnd = create<DndStore>((set) => ({
  droppedName: "",
  setDroppedName: (name: string) => set({ droppedName: name }),
}));

// chips store
interface SavedChipsStore {
  savedChips: CircuitModule[];
  setSavedChips: (chips: CircuitModule[]) => void;
}

export const useSavedChips = create<SavedChipsStore>()(
  persist(
    (set) => ({
      savedChips: [],
      setSavedChips: (chips: CircuitModule[]) => set({ savedChips: chips }),
    }),
    {
      name: LOCAL_STORAGE_SAVED_CHIPS,
      version: 1,
    },
  ),
);

// flow store
interface FlowStore {
  nodes: Node<Chip>[];
  edges: Edge<Wire>[];
  setNodes: (nodes: Node<Chip>[] | ((prev: Node<Chip>[]) => Node<Chip>[])) => void;
  setEdges: (edges: Edge<Wire>[] | ((prev: Edge<Wire>[]) => Edge<Wire>[])) => void;
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      setNodes: (updater: Node<Chip>[] | ((prev: Node<Chip>[]) => Node<Chip>[])) =>
        set((state) => ({
          nodes:
            typeof updater === "function" ? (updater as (prev: Node<Chip>[]) => Node<Chip>[])(state.nodes) : updater,
        })),
      setEdges: (updater: Edge<Wire>[] | ((prev: Edge<Wire>[]) => Edge<Wire>[])) =>
        set((state) => ({
          edges:
            typeof updater === "function" ? (updater as (prev: Edge<Wire>[]) => Edge<Wire>[])(state.edges) : updater,
        })),
    }),
    {
      name: LOCAL_STORAGE_FLOW,
      version: 1,
    },
  ),
);
