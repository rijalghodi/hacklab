"use client";

import { create } from "zustand";
interface DndStore {
  droppedName: string;
  setDroppedName: (name: string) => void;
}

export const useDnd = create<DndStore>((set) => ({
  droppedName: "",
  setDroppedName: (name: string) => set({ droppedName: name }),
}));
