"use client";

import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { builtInChips } from "@/lib/constants/chips";
import { LOCAL_STORAGE_FLOW, LOCAL_STORAGE_SAVED_CHIPS } from "@/lib/constants/names";
import { CircuitModule, StatefulChip,StatefulWire } from "@/lib/types/flow";

interface DndStore {
  droppedName: string;
  setDroppedName: (name: string) => void;
}

export const useDnd = create<DndStore>((set) => ({
  droppedName: "",
  setDroppedName: (name: string) => set({ droppedName: name }),
}));

// chips store
interface ChipsStore {
  savedChips: CircuitModule[];
  setSavedChips: (chips: CircuitModule[]) => void;
  // allChips: CircuitModule[];
  getChip: (name: string) => CircuitModule | undefined;
}

export const useChips = create<ChipsStore>()(
  persist(
    (set, get) => ({
      savedChips: [],
      setSavedChips: (chips: CircuitModule[]) => set({ savedChips: chips }),
      // get allChips() {
      //   return [...get().savedChips, ...builtInChips];
      // },
      getChip: (name: string) =>
        get()
          .savedChips.concat(builtInChips)
          .find((chip) => chip.name === name),
    }),
    {
      name: LOCAL_STORAGE_SAVED_CHIPS,
      version: 1,
    },
  ),
);

// flow store
interface FlowStore {
  nodes: Node<StatefulChip>[];
  edges: Edge<StatefulWire>[];
  setNodes: (nodes: Node<StatefulChip>[] | ((prev: Node<StatefulChip>[]) => Node<StatefulChip>[])) => void;
  setEdges: (edges: Edge<StatefulWire>[] | ((prev: Edge<StatefulWire>[]) => Edge<StatefulWire>[])) => void;
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      setNodes: (updater: Node<StatefulChip>[] | ((prev: Node<StatefulChip>[]) => Node<StatefulChip>[])) =>
        set((state) => ({
          nodes:
            typeof updater === "function"
              ? (updater as (prev: Node<StatefulChip>[]) => Node<StatefulChip>[])(state.nodes)
              : updater,
        })),
      setEdges: (updater: Edge<StatefulWire>[] | ((prev: Edge<StatefulWire>[]) => Edge<StatefulWire>[])) =>
        set((state) => ({
          edges:
            typeof updater === "function"
              ? (updater as (prev: Edge<StatefulWire>[]) => Edge<StatefulWire>[])(state.edges)
              : updater,
        })),
    }),
    {
      name: LOCAL_STORAGE_FLOW,
      version: 1,
    },
  ),
);
