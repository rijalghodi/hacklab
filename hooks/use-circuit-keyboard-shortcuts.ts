"use client";

import { useEffect } from "react";

import { useSaveChipDialogStore } from "./save-chip-dialog-store";
import { useCircuitPageParams } from "./use-circuit-page-params";
import { useDeleteChipHandler } from "./use-delete-chip-handler";

export function useCircuitKeyboardShortcuts(undo?: () => void, redo?: () => void, disableShortcuts?: boolean) {
  const { navigateToChip, chipType } = useCircuitPageParams();
  const { openDialog: openSaveChipDialog } = useSaveChipDialogStore();
  const { deleteChipWithConfirm } = useDeleteChipHandler();

  useEffect(() => {
    if (disableShortcuts) return; // Don't add event listeners if shortcuts are disabled

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

        case "z":
          // Undo: Ctrl+Z (or Cmd+Z on Mac)
          if (!event.shiftKey) {
            event.preventDefault();
            undo?.();
          }
          break;

        case "y":
          // Redo: Ctrl+Y (or Cmd+Y on Mac)
          event.preventDefault();
          redo?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateToChip, openSaveChipDialog, deleteChipWithConfirm, chipType, undo, redo, disableShortcuts]);
}
