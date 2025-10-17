import { useNodes } from "@xyflow/react";
import { Node } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";

import { CircuitChip } from "@/lib/types/chips";

import { useConfirmDialogStore } from "./confirm-dialog-store";
import { useChips } from "./use-chips-store";
import { useCircuitPageParams } from "./use-circuit-page-params";

export function useDeleteChipHandler() {
  const { navigateToChipId, chipId: chipIdParam } = useCircuitPageParams();
  const { deleteSavedChip, getChipById } = useChips();
  const { openDialog: openConfirmDialog } = useConfirmDialogStore();
  const nodes = useNodes<Node<CircuitChip>>();

  const deleteChipWithConfirm = useCallback(
    async (chipId: string) => {
      if (!chipId) {
        toast.error("Failed to delete chip: No chip ID provided");
        return;
      }
      const chip = getChipById(chipId);
      if (!chip) {
        toast.error(`Failed to delete chip '${chipId}': Chip not found`);
        return;
      }
      const affectedNodes = nodes.filter((node) => node.data.chips?.some((chip) => chip.id === chipId));

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
        onConfirm: () => {
          try {
            deleteSavedChip(chipId);
            if (chipIdParam && chipIdParam === chipId) {
              navigateToChipId(null);
            }
          } catch (error) {
            toast.error(
              `Failed to delete chip '${chipId}': ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        },
      });
    },
    [navigateToChipId, openConfirmDialog, deleteSavedChip, chipIdParam],
  );

  return { deleteChipWithConfirm };
}
