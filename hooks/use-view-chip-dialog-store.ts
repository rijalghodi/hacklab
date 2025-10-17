import { create } from "zustand";

type ViewChipDialogState = {
  open: boolean;
  nodeStack: string[] | null;
  pushNode: (nodeId: string) => void;
  popNode: () => void;
  viewChip: (chipName: string) => void;
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
  viewChip: (chipName: string) => {
    set((state) => ({
      nodeStack: [...(state.nodeStack || []), chipName],
      open: true,
    }));
  },
  closeViewChip: () =>
    set((state) => {
      const newNodeStack = state.nodeStack?.slice(0, -1);
      return {
        nodeStack: newNodeStack,
        open: newNodeStack ? newNodeStack.length > 0 : false,
      };
    }),
}));
