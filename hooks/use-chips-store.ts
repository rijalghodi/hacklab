"use client";

import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { builtInChips } from "@/lib/constants/chips";
import { LOCAL_STORAGE_SAVED_CHIPS } from "@/lib/constants/names";
import { CircuitChip } from "@/lib/types/chips";

interface ChipsStore {
  savedChips: CircuitChip[];
  setSavedChips: (chips: CircuitChip[]) => void;
  addSavedChip: (chip: CircuitChip) => void;
  updateSavedChip: (chipId: string, chip: CircuitChip) => void;
  getAllChips: () => CircuitChip[];
  getChip: (name: string) => CircuitChip | null;
  getChipById: (id: string) => CircuitChip | null;
  deleteSavedChip: (id: string) => void;
}

export const useChips = create<ChipsStore>()(
  persist(
    (set, get) => ({
      savedChips: [],
      setSavedChips: (chips: CircuitChip[]) => set({ savedChips: chips }),
      addSavedChip: (chip: CircuitChip) => {
        try {
          const currentSavedChips = get().savedChips;
          const allChips = [...currentSavedChips, ...builtInChips];
          const isDuplicate = allChips.some((c) => c.name === chip.name || c.id === chip.id);
          if (isDuplicate) return toast.error("Chip name already taken");

          // Create a clean copy without circular references
          const cleanChip = {
            ...chip,
          };

          set({ savedChips: [...currentSavedChips, cleanChip] });
        } catch (error) {
          throw new Error(`Failed to add chip '${chip.name}'`, { cause: error });
        }
      },
      updateSavedChip: (chipId: string, chip: CircuitChip) => {
        try {
          const cleanChip = {
            ...chip,
            definitions: undefined, // Remove definitions to avoid circular refs
          };
          set({ savedChips: get().savedChips.map((c) => (c.id === chipId ? cleanChip : c)) });
        } catch (error) {
          throw new Error(`Failed to update chip '${chipId}'`, { cause: error });
        }
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
      deleteSavedChip: (id: string) => {
        try {
          // delete chip from other chips definitions
          const chips = get().savedChips.filter((c) => c.id !== id);
          const newChips: CircuitChip[] = [];

          for (const circuit of chips) {
            const newCircuitChips = circuit.chips?.filter((c) => c.id !== id);
            const newCircuitWires = circuit.wires?.filter((w) => w.sourceId !== id && w.targetId !== id);
            newChips.push({
              ...circuit,
              chips: newCircuitChips,
              wires: newCircuitWires,
            });
          }

          set({ savedChips: newChips });
        } catch (error) {
          throw new Error(`Failed to delete chip '${id}'`, { cause: error });
        }
      },
    }),
    {
      name: LOCAL_STORAGE_SAVED_CHIPS,
      version: 1,
    },
  ),
);
