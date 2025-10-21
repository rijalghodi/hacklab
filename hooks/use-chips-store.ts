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
  updateSavedChip: (chipType: string, chip: Partial<CircuitChip>) => void;
  getAllChips: () => CircuitChip[];
  getChip: (chipType: string) => CircuitChip | null;
  // getChipById: (id: string) => CircuitChip | null;
  deleteSavedChip: (chipType: string) => void;
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
          if (isDuplicate) {
            throw new Error("Chip name already taken");
          }
          chip.definitions = undefined;

          set({ savedChips: [...currentSavedChips, chip] });
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Unknown error");
        }
      },
      updateSavedChip: (chipType: string, chip: Partial<CircuitChip>) => {
        try {
          // find
          const chipFull = get().savedChips.find((c) => c.chipType === chipType);
          if (!chipFull) {
            throw new Error(`Chip '${chipType}' not found`);
          }
          const cleanChip = {
            ...chipFull,
            ...chip,
            definitions: undefined, // Remove definitions to avoid circular refs
          };
          set({ savedChips: get().savedChips.map((c) => (c.chipType === chipType ? cleanChip : c)) });
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Unknown error");
        }
      },
      getAllChips() {
        return [...get().savedChips, ...builtInChips];
      },
      getChip: (chipType: string) => {
        const allChips = [...get().savedChips, ...builtInChips];
        const chip = allChips.find((chip) => chip.chipType === chipType);
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
      deleteSavedChip: (chipType: string) => {
        try {
          // delete chip from other chips definitions
          const chips = get().savedChips.filter((c) => c.chipType !== chipType);
          const newChips: CircuitChip[] = [];

          for (const circuit of chips) {
            const newCircuitChips = circuit.chips?.filter((c) => c.chipType !== chipType);
            const newCircuitWires = circuit.wires?.filter((w) => w.sourceId !== chipType && w.targetId !== chipType);
            newChips.push({
              ...circuit,
              chips: newCircuitChips,
              wires: newCircuitWires,
            });
          }

          set({ savedChips: newChips });
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Unknown error");
        }
      },
    }),
    {
      name: LOCAL_STORAGE_SAVED_CHIPS,
      version: 1,
    },
  ),
);
