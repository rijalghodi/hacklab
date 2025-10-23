"use client";

import { useLiveQuery } from "dexie-react-hooks";

import { builtInChips } from "@/lib/constants/chips";
import { chipsDb, CircuitChipDB } from "@/lib/db/chips-db";
import { logger } from "@/lib/logger";

export function useSavedChips(): CircuitChipDB[] | undefined {
  return useLiveQuery(() => chipsDb.savedChips.toArray());
}

export function useAllChips(): CircuitChipDB[] {
  const savedChips = useSavedChips();
  return [...builtInChips, ...(savedChips ?? [])];
}

export function useSavedChip(chipType: string): CircuitChipDB | undefined | null {
  // find from built-in chips first
  const builtInChip = builtInChips.find((chip) => chip.chipType === chipType);
  if (builtInChip) {
    return builtInChip;
  }
  const savedChip = useLiveQuery(() => chipsDb.savedChips.where("chipType").equals(chipType).first());
  return savedChip;
}

export function useAllChildChipTypes(chipType: string): string[] {
  const savedChips = useSavedChips();
  logger.debug({ group: "useAllChildChipTypes", message: `savedChips`, data: { savedChips, chipType } });
  if (!savedChips) return [];
  const childChipTypes = getAllChildChipTypes(chipType, new Set<string>(), savedChips);
  logger.debug({ group: "useAllChildChipTypes", message: `childChipTypes`, data: { childChipTypes } });
  return getAllChildChipTypes(chipType, new Set<string>(), savedChips);
}

export const getAllChildChipTypes = (
  currentChipType: string,
  visited = new Set<string>(),
  savedChips: CircuitChipDB[],
): string[] => {
  // Prevent cycles
  if (visited.has(currentChipType)) return [];
  logger.debug({
    group: "getAllChildChipTypes",
    message: `getAllChildChipTypes: currentChipType=${currentChipType}`,
    data: { visited },
  });
  visited.add(currentChipType);

  // Find direct children: chips that include currentChipType in their chips array
  const directChildren = savedChips.filter((chip) => chip.chips?.some((c) => c.chipType === currentChipType));
  logger.debug({
    group: "getAllChildChipTypes",
    message: `getAllChildChipTypes: directChildren=${directChildren.length}`,
    data: { directChildren },
  });
  // Start accumulating results
  let allChildren: string[] = [];

  for (const child of directChildren) {
    allChildren.push(child.chipType);

    // Recursively find descendants
    logger.debug({
      group: "getAllChildChipTypes",
      message: `getAllChildChipTypes: child=${child.chipType}`,
      data: { visited },
    });
    const descendants = getAllChildChipTypes(child.chipType, visited, savedChips);
    allChildren = allChildren.concat(descendants);
  }

  return allChildren;
};
