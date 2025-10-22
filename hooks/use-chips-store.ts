"use client";

import { toast } from "sonner";

import { builtInChips } from "@/lib/constants/chips";
import { chipsDb, CircuitChipDB } from "@/lib/db/chips-db";
import { CircuitChip } from "@/lib/types/chips";

export const getSavedChip = async (chipType: string): Promise<CircuitChipDB | null> => {
  const savedChip = await chipsDb.savedChips.where("chipType").equals(chipType).first();
  return savedChip || null;
};

// Add a new chip
export const addSavedChip = async (chip: CircuitChipDB) => {
  try {
    // Check for duplicates
    const existingChips = await chipsDb.savedChips.toArray();
    const allChips = [...existingChips, ...builtInChips];
    const isDuplicateName = allChips.some((c) => c.name === chip.name);

    if (isDuplicateName) {
      throw new Error("Chip name already taken");
    }

    // Convert to database format (remove definitions)
    await chipsDb.savedChips.add(chip);
  } catch (error) {
    console.error("Failed to add saved chip:", error);
    toast.error("Failed to add chip");
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
};

// Update an existing chip
export const updateSavedChip = async (chipType: string, chip: Partial<CircuitChip>) => {
  try {
    const existingChips = await chipsDb.savedChips.toArray();
    const chipFull = existingChips.find((c) => c.chipType === chipType);

    if (!chipFull) {
      throw new Error(`Chip '${chipType}' not found`);
    }

    const updatedChip = { ...chipFull, ...chip };
    const { definitions, ...cleanChip } = updatedChip;

    await chipsDb.savedChips.update(chipType, cleanChip);
  } catch (error) {
    console.error("Failed to update saved chip:", error);
    toast.error("Failed to update chip");
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
};

// Delete a chip
export const deleteSavedChip = async (chipType: string) => {
  try {
    // Wrapped the delete & update logic in a single transaction on the database
    await chipsDb.transaction("rw", [chipsDb.savedChips], async () => {
      // Delete the chip
      await chipsDb.savedChips.delete(chipType);

      // Update other chips that reference this chip
      const remainingChips = await chipsDb.savedChips.toArray();
      const updatedChips: CircuitChipDB[] = [];

      for (const circuit of remainingChips) {
        const newCircuitChips = circuit.chips?.filter((c) => c.chipType !== chipType);
        const newCircuitWires = circuit.wires?.filter((w) => w.sourceId !== chipType && w.targetId !== chipType);

        updatedChips.push({
          ...circuit,
          chips: newCircuitChips,
          wires: newCircuitWires,
        });
      }

      // Update database with cleaned chips
      await chipsDb.savedChips.clear();
      await chipsDb.savedChips.bulkAdd(updatedChips);
    });
  } catch (error) {
    console.error("Failed to delete saved chip:", error);
    toast.error("Failed to delete chip");
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
};

// Set all chips (for bulk operations)
export const setSavedChips = async (chips: CircuitChip[]) => {
  try {
    await chipsDb.savedChips.clear();
    const cleanChips = chips.map((chip) => {
      const { definitions, ...cleanChip } = chip;
      return cleanChip;
    });
    await chipsDb.savedChips.bulkAdd(cleanChips);
  } catch (error) {
    console.error("Failed to set saved chips:", error);
    toast.error("Failed to save chips");
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
};
