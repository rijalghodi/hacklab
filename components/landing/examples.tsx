"use client";

import { ReactFlowProvider } from "@xyflow/react";

import { andChip, orChip } from "@/lib/constants/chips";
import { CircuitChip } from "@/lib/types/chips";

import { Circuit } from "../flow";
import { nandChipDemo } from "../flow/circuit-demo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type Example = {
  id: number;
  title: string;
  circuit: CircuitChip;
};

const EXAMPLES: Example[] = [
  {
    id: 0,
    title: "NAND Gate",
    circuit: nandChipDemo,
  },
  {
    id: 1,
    title: "AND Gate",
    circuit: andChip,
  },
  {
    id: 2,
    title: "OR Gate",
    circuit: orChip,
  },
];

export function Examples() {
  return (
    <section id="examples" className="border-t">
      {/* Examples */}
      <div className="container mx-auto max-w-7xl border-x px-6 md:px-10 pt-24 pb-20">
        <h2 className="text-4xl font-bold text-foreground leading-snug mb-6">Circuit Examples</h2>
        <Tabs defaultValue="0">
          <div className="w-full z-10 mb-4">
            <TabsList className="flex justify-center gap-4">
              {EXAMPLES.map((example) => (
                <TabsTrigger key={example.id} value={example.id.toString()} className="text-lg font-mono font-bold">
                  {example.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {EXAMPLES.map((example) => (
            <TabsContent
              key={example.id}
              value={example.id.toString()}
              className="w-full aspect-video border rounded-2xl relative overflow-hidden"
            >
              <ReactFlowProvider>
                <Circuit
                  initialCircuit={example.circuit}
                  viewOnly
                  showTitle={false}
                  showControls={false}
                  contextMenuEnabled={false}
                  disableShortcuts={true}
                  minZoom={0.5}
                  maxZoom={2}
                  isFitView={true}
                  // style={{ "--xy-background-color": "transparent" } as React.CSSProperties}
                />
              </ReactFlowProvider>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
