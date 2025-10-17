import { create } from "zustand";

type ViewChipDialogState = {
  open: boolean;
  nodeStack: string[] | null;
  pushNode: (nodeId: string) => void;
  popNode: () => void;
  viewChip: (nodeId: string) => void;
  closeViewChip: () => void;
};

export const useViewChipDialogStore = create<ViewChipDialogState>((set) => ({
  open: false,
  nodeStack: null,
  pushNode: (nodeId: string) =>
    set((state) => ({
      nodeStack: [...(state.nodeStack || []), nodeId],
    })),
  popNode: () =>
    set((state) => ({
      nodeStack: state.nodeStack?.slice(0, -1),
    })),
  viewChip: (nodeId: string) => {
    set((state) => ({
      nodeStack: [...(state.nodeStack || []), nodeId],
      open: true,
    }));
  },
  closeViewChip: () =>
    set((state) => ({
      nodeStack: state.nodeStack?.slice(0, -1),
      open: state.nodeStack?.length === 0,
    })),
}));
