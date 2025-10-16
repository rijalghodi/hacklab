import { create } from "zustand";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  openDialog: (options: {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
  }) => void;
  closeDialog: () => void;
}

export const useConfirmDialogStore = create<ConfirmDialogState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  onConfirm: () => {},
  onCancel: undefined,
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "default",
  openDialog: (options) =>
    set({
      isOpen: true,
      title: options.title,
      description: options.description,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel",
      variant: options.variant || "default",
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      title: "",
      description: "",
      onConfirm: () => {},
      onCancel: undefined,
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "default",
    }),
}));
