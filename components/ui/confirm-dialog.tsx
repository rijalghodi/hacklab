"use client";

import { useConfirmDialogStore } from "@/hooks/confirm-dialog-store";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmDialog() {
  const { isOpen, title, description, onConfirm, onCancel, confirmText, cancelText, variant, closeDialog } =
    useConfirmDialogStore();

  const handleConfirm = () => {
    onConfirm();
    closeDialog();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent showCloseButton={false} className="font-mono">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-base mt-3">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button variant={variant} className="flex-1" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
