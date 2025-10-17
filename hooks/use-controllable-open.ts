"use client";

import { useState } from "react";

type UseControllableProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function useControllableOpen(props?: UseControllableProps) {
  const { open: controlledOpen, onOpenChange: controlledOnOpenChange } = props || {};
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(false);

  const isControlled = controlledOpen !== undefined;

  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const onOpenChange = (nextOpen: boolean) => {
    if (controlledOnOpenChange) controlledOnOpenChange(nextOpen);
    if (!isControlled) setUncontrolledOpen(nextOpen);
  };

  return { open, onOpenChange };
}
