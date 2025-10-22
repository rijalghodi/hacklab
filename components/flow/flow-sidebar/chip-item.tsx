import React, { useCallback } from "react";

import { cn, getBgBorderTextColor } from "@/lib/utils";

export type ContextChip = {
  name?: string;
  chipType: string;
};

export type ChipItemProps = {
  color?: string;
  name?: string;
  chipType: string;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent, chip: ContextChip) => void;
  selected?: boolean;
  disabled?: boolean;
} & Omit<React.ComponentProps<"div">, "onContextMenu">;

export function ChipItem({
  color,
  name,
  chipType,
  onDragStart,
  onContextMenu,
  selected,
  disabled,
  ...props
}: ChipItemProps) {
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      onContextMenu?.(e, { name, chipType });
    },
    [onContextMenu, name, chipType],
  );

  return (
    <div
      data-selected={selected}
      className={cn(
        "px-2 py-1 font-mono box-border min-w-18 h-10 flex items-center justify-center text-base font-semibold cursor-grab rounded-sm",
        "data-[selected=true]:ring-ring/80 data-[selected=true]:ring-3",
        "hover:ring-ring/80 hover:ring-3",
        disabled && "opacity-50 cursor-default",
      )}
      style={getBgBorderTextColor(color)}
      onDragStart={onDragStart}
      onContextMenu={handleContextMenu}
      draggable={!disabled}
      title={disabled ? "Cannot add the chip due to cyclic dependency" : ""}
      {...props}
    >
      <div>
        {name}
        {/* <div className="text-[8px]">{chipType}</div> */}
      </div>
    </div>
  );
}
