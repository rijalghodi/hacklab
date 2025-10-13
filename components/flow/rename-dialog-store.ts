import { create } from "zustand";

interface RenameDialogState {
  isOpen: boolean;
  nodeId: string | null;
  initialName: string;
  openDialog: (nodeId: string, initialName: string) => void;
  closeDialog: () => void;
}

export const useRenameDialogStore = create<RenameDialogState>((set) => ({
  isOpen: false,
  nodeId: null,
  initialName: "",
  openDialog: (nodeId: string, initialName: string) =>
    set({
      isOpen: true,
      nodeId,
      initialName,
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      nodeId: null,
      initialName: "",
    }),
}));
