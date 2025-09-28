"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Circuit, CircuitModule, Chip, Wire } from "@/lib/types/flow";
import { LOCAL_STORAGE_CIRCUIT, LOCAL_STORAGE_SAVED_CHIPS } from "@/lib/constants/names";
import { Edge, Node } from "@xyflow/react";

interface DndStore {
  type: string;
  setType: (type: string) => void;
}

export const useDnd = create<DndStore>((set) => ({
  type: "",
  setType: (type: string) => set({ type }),
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

// circuit store
interface CircuitStore {
  // circuit: Circuit;
  chips: Node<Chip>[];
  wires: Edge<Wire>[];
  setChips: (chips: Node<Chip>[] | ((prev: Node<Chip>[]) => Node<Chip>[])) => void;
  setWires: (wires: Edge<Wire>[] | ((prev: Edge<Wire>[]) => Edge<Wire>[])) => void;
}

export const useCircuit = create<CircuitStore>()(
  persist(
    (set) => ({
      chips: [],
      wires: [],
      setChips: (updater: Node<Chip>[] | ((prev: Node<Chip>[]) => Node<Chip>[])) =>
        set((state) => ({
          chips:
            typeof updater === "function" ? (updater as (prev: Node<Chip>[]) => Node<Chip>[])(state.chips) : updater,
        })),
      setWires: (updater: Edge<Wire>[] | ((prev: Edge<Wire>[]) => Edge<Wire>[])) =>
        set((state) => ({
          wires:
            typeof updater === "function" ? (updater as (prev: Edge<Wire>[]) => Edge<Wire>[])(state.wires) : updater,
        })),
    }),
    {
      name: LOCAL_STORAGE_CIRCUIT,
      version: 1,
    },
  ),
);
