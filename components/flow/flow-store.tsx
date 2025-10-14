"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { builtInChips } from "@/lib/constants/chips";
import { LOCAL_STORAGE_SAVED_CHIPS } from "@/lib/constants/names";
import { CircuitChip } from "@/lib/types/chips";

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
  savedChips: CircuitChip[];
  setSavedChips: (chips: CircuitChip[]) => void;
  addSavedChip: (chip: CircuitChip) => void;
  updateSavedChip: (chip: CircuitChip) => void;
  getAllChips: () => CircuitChip[];
  getChip: (name: string) => CircuitChip | undefined;
  getChipById: (id: string) => CircuitChip | undefined;
}

export const useChips = create<ChipsStore>()(
  persist(
    (set, get) => ({
      savedChips: [],
      setSavedChips: (chips: CircuitChip[]) => set({ savedChips: chips }),
      addSavedChip: (chip: CircuitChip) => set({ savedChips: [...get().savedChips, chip] }),
      updateSavedChip: (chip: CircuitChip) =>
        set({ savedChips: get().savedChips.map((c) => (c.id === chip.id ? chip : c)) }),
      getAllChips() {
        return [...get().savedChips, ...builtInChips];
      },
      getChip: (name: string) => {
        const allChips = [...get().savedChips, ...builtInChips];
        const chip = allChips.find((chip) => chip.name === name);
        if (!chip) {
          throw new Error(`Chip '${name}' not found`);
        }
        chip.definitions = allChips;
        return chip!;
      },
      getChipById: (id: string) => {
        const allChips = [...get().savedChips, ...builtInChips];
        const chip = allChips.find((chip) => chip.id === id);
        if (!chip) {
          throw new Error(`Chip '${id}' not found`);
        }
        chip.definitions = allChips;
        return chip!;
      },
    }),
    {
      name: LOCAL_STORAGE_SAVED_CHIPS,
      version: 1,
    },
  ),
);

// flow store
// interface FlowStore {
//   nodes: Node<CircuitChip>[];
//   edges: Edge<Wire>[];
//   setNodes: (nodes: Node<CircuitChip>[] | ((prev: Node<CircuitChip>[]) => Node<CircuitChip>[])) => void;
//   setEdges: (edges: Edge<Wire>[] | ((prev: Edge<Wire>[]) => Edge<Wire>[])) => void;
// }

// export const useFlowStore = create<FlowStore>()(
//   persist(
//     (set) => ({
//       nodes: [],
//       edges: [],
//       setNodes: (updater: Node<CircuitChip>[] | ((prev: Node<CircuitChip>[]) => Node<CircuitChip>[])) =>
//         set((state) => ({
//           nodes:
//             typeof updater === "function"
//               ? (updater as (prev: Node<CircuitChip>[]) => Node<CircuitChip>[])(state.nodes)
//               : updater,
//         })),
//       setEdges: (updater: Edge<Wire>[] | ((prev: Edge<Wire>[]) => Edge<Wire>[])) =>
//         set((state) => ({
//           edges:
//             typeof updater === "function" ? (updater as (prev: Edge<Wire>[]) => Edge<Wire>[])(state.edges) : updater,
//         })),
//     }),
//     {
//       name: LOCAL_STORAGE_FLOW,
//       version: 1,
//     },
//   ),
// );
