import { CircuitChipDB } from "@/lib/db/chips-db";

export const getAllChildChipTypes = (
  currentChipType: string,
  visited = new Set<string>(),
  savedChips: CircuitChipDB[],
): string[] => {
  // Prevent cycles
  if (visited.has(currentChipType)) return [];
  visited.add(currentChipType);

  // Find direct children: chips that include currentChipType in their chips array
  const directChildren = savedChips.filter((chip) => chip.chips?.some((c) => c.chipType === currentChipType));

  // Start accumulating results
  let allChildren: string[] = [];

  for (const child of directChildren) {
    allChildren.push(child.chipType);

    // Recursively find descendants
    const descendants = getAllChildChipTypes(child.chipType, visited, savedChips);
    allChildren = allChildren.concat(descendants);
  }

  return allChildren;
};
