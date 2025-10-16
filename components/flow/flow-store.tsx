"use client";

import { toast } from "sonner";
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
  updateSavedChip: (chipId: string, chip: CircuitChip) => void;
  getAllChips: () => CircuitChip[];
  getChip: (name: string) => CircuitChip | null;
  getChipById: (id: string) => CircuitChip | null;
}

export const useChips = create<ChipsStore>()(
  persist(
    (set, get) => ({
      savedChips: [],
      setSavedChips: (chips: CircuitChip[]) => set({ savedChips: chips }),
      addSavedChip: (chip: CircuitChip) => {
        const currentSavedChips = get().savedChips;
        const allChips = [...currentSavedChips, ...builtInChips];
        const isDuplicate = allChips.some((c) => c.name === chip.name || c.id === chip.id);
        if (isDuplicate) return toast.error("Chip name already taken");

        // Create a clean copy without circular references
        const cleanChip = {
          ...chip,
          definitions: undefined, // Remove definitions to avoid circular refs
        };

        set({ savedChips: [...currentSavedChips, cleanChip] });
      },
      updateSavedChip: (chipId: string, chip: CircuitChip) => {
        const cleanChip = {
          ...chip,
          definitions: undefined, // Remove definitions to avoid circular refs
        };
        set({ savedChips: get().savedChips.map((c) => (c.id === chipId ? cleanChip : c)) });
      },
      getAllChips() {
        return [...get().savedChips, ...builtInChips];
      },
      getChip: (name: string) => {
        const allChips = [...get().savedChips, ...builtInChips];
        const chip = allChips.find((chip) => chip.name === name);
        if (!chip) return null;

        // Return a copy with definitions to avoid mutating the original
        return {
          ...chip,
          definitions: allChips,
        };
      },
      getChipById: (id: string) => {
        const allChips = [...get().savedChips, ...builtInChips];
        const chip = allChips.find((chip) => chip.id === id);
        if (!chip) return null;

        // Return a copy with definitions to avoid mutating the original
        return {
          ...chip,
          definitions: allChips,
        };
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
