"use client";

import { create } from "zustand";
interface DndStore {
  dropped: string | null;
  setDropped: (dropped: string | null) => void;
}

export const useDndStore = create<DndStore>((set) => ({
  dropped: null,
  setDropped: (dropped: string | null) => set({ dropped }),
}));
