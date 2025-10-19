"use client";

import React from "react";

import { CircuitChip, PortType } from "@/lib/types/chips";

import { Circuit } from "./circuit";

export const nandChipDemo: CircuitChip = {
  id: "nand-demo",
  name: "NAND DEMO",
  chips: [
    {
      name: "NAND",
      id: "nand",
      position: { x: 0, y: 0 },
    },
  ],
  ports: [
    { id: "a", name: "a", type: PortType.IN, position: { x: -110, y: -40 } },
    { id: "b", name: "b", type: PortType.IN, position: { x: -110, y: 50 } },
    { id: "out", name: "out", type: PortType.OUT, position: { x: 90, y: 3 } },
  ],
  wires: [
    {
      id: "wire-1",
      sourceId: "a",
      sourcePortId: "a",
      targetId: "nand",
      targetPortId: "nand.port-a",
    },
    {
      id: "wire-2",
      sourceId: "b",
      sourcePortId: "b",
      targetId: "nand",
      targetPortId: "nand.port-b",
    },
    {
      id: "wire-3",
      sourceId: "nand",
      sourcePortId: "nand.port-out",
      targetId: "out",
      targetPortId: "out",
    },
  ],
  definitions: [],
};

export function CircuitDemo() {
  return (
    <div className="h-full w-full relative">
      <Circuit
        initialCircuit={nandChipDemo}
        viewOnly
        showTitle={false}
        withBackground={false}
        showControls={false}
        nodesDraggable={false}
        zoomEnabled={false}
        contextMenuEnabled={false}
        minZoom={0.5}
        isFitView={true}
        style={{ "--xy-background-color": "transparent" } as React.CSSProperties}
      />
    </div>
  );
}
