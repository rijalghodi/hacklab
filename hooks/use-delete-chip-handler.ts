import { useNodes } from "@xyflow/react";
import { Node } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";

import { CircuitChip } from "@/lib/types/chips";

import { useConfirmDialogStore } from "./confirm-dialog-store";
import { useSavedChips } from "./use-chips-data";
import { deleteSavedChip } from "./use-chips-store";
import { useCircuitPageParams } from "./use-circuit-page-params";

export function useDeleteChipHandler() {
  const { navigateToChip, chipType: chipTypeParam } = useCircuitPageParams();
  const savedChips = useSavedChips();
  const { openDialog: openConfirmDialog } = useConfirmDialogStore();
  const nodes = useNodes<Node<CircuitChip>>();

  const deleteChipWithConfirm = useCallback(
    async (chipType: string) => {
      if (!chipType) {
        toast.error("Failed to delete chip: No chip ID provided");
        return;
      }

      try {
        const chip = savedChips?.find((c) => c.chipType === chipType);
        if (!chip) {
          toast.error(`Failed to delete chip '${chipType}': Chip not found`);
          return;
        }

        const affectedNodes = nodes.filter((node) => node.data.chips?.some((chip) => chip.chipType === chipType));

        let description = `Are you sure you want to delete chip "${chip.name}"?`;

        if (affectedNodes.length > 0) {
          const firstNodeName = affectedNodes[0]?.data.name;

          if (affectedNodes.length === 1) {
            description += `\nIt is used by "${firstNodeName}"`;
          } else if (affectedNodes.length === 2) {
            const secondNodeName = affectedNodes[1]?.data.name;
            description += `\nIt is used by "${firstNodeName}" and "${secondNodeName}"`;
          } else {
            const othersCount = affectedNodes.length - 1;
            description += `\nIt is used by "${firstNodeName}" and ${othersCount} others`;
          }
        }

        openConfirmDialog({
          title: "Delete Chip",
          description,
          confirmText: "Delete",
          cancelText: "Cancel",
          variant: "destructive",
          onConfirm: async () => {
            try {
              await deleteSavedChip(chipType);
              if (chipTypeParam && chipTypeParam === chipType) {
                navigateToChip(null);
              }
            } catch (error) {
              toast.error(
                `Failed to delete chip '${chipType}': ${error instanceof Error ? error.message : "Unknown error"}`,
              );
            }
          },
        });
      } catch (error) {
        toast.error(`Failed to load chip '${chipType}': ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
    [navigateToChip, openConfirmDialog, chipTypeParam, savedChips, nodes],
  );

  return { deleteChipWithConfirm };
}
