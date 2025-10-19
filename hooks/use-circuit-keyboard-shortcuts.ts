"use client";

import { useEffect } from "react";

import { useSaveChipDialogStore } from "./save-chip-dialog-store";
import { useCircuitPageParams } from "./use-circuit-page-params";
import { useDeleteChipHandler } from "./use-delete-chip-handler";

export function useCircuitKeyboardShortcuts() {
  const { navigateToChip, chipType } = useCircuitPageParams();
  const { openDialog: openSaveChipDialog } = useSaveChipDialogStore();
  const { deleteChipWithConfirm } = useDeleteChipHandler();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Cmd (Mac)
      const isModifierPressed = event.ctrlKey || event.metaKey;

      if (!isModifierPressed) return;

      switch (event.key) {
        case "N":
          // Check for Shift key for Ctrl+Shift+N
          if (event.shiftKey) {
            event.preventDefault();
            navigateToChip(null);
          }
          break;

        case "s":
          event.preventDefault();
          openSaveChipDialog();
          break;

        case "Backspace":
          // Only allow delete when chipType is not null
          if (chipType) {
            event.preventDefault();
            deleteChipWithConfirm(chipType);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateToChip, openSaveChipDialog, deleteChipWithConfirm, chipType]);
}
