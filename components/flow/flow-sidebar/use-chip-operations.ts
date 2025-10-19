import { useCallback, useMemo } from "react";

import { useChips } from "@/hooks";

export function useChipOperations(chipType?: string) {
  const { savedChips } = useChips();

  const getAllChildChipTypes = useCallback(
    (currentChipType: string, visited = new Set<string>()) => {
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
        const descendants = getAllChildChipTypes(child.chipType, visited);
        allChildren = allChildren.concat(descendants);
      }

      return allChildren;
    },
    [savedChips],
  );

  const childChipTypes = useMemo(() => {
    if (!chipType) return [];
    // Deduplicate results using Set
    return Array.from(new Set(getAllChildChipTypes(chipType)));
  }, [getAllChildChipTypes, chipType]);

  return {
    childChipTypes,
    getAllChildChipTypes,
  };
}
