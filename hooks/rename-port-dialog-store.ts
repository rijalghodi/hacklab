import { create } from "zustand";

type RenamePortDialogState = {
  isOpen: boolean;
  nodeId: string | null;
  initialName: string;
  openDialog: (nodeId: string, initialName: string) => void;
  closeDialog: () => void;
};

export const useRenamePortDialogStore = create<RenamePortDialogState>((set) => ({
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
