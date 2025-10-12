import { useCallback,useEffect, useMemo, useState } from "react";

import { buildCircuit } from "@/lib/circuitBuilder";
import type { CircuitChip, Port as PortType } from "@/lib/types/chips";

type Props = { circuit: CircuitChip };

export default function LogicGate({ circuit }: Props) {
  // Build circuit once
  const circuitInstance = useMemo(() => buildCircuit(circuit), [circuit]);

  // Local UI state for ports
  const [ports, setPorts] = useState<PortType[]>(circuit.ports);

  // Subscribe to outputs
  useEffect(() => {
    const subs = circuit.ports
      .filter((p) => p.type === "OUT")
      .map((p) => {
        const out$ = circuitInstance.outputs[p.id];
        if (!out$) return null;
        return out$.subscribe((v) => {
          setPorts((prev) => prev.map((pp) => (pp.id === p.id ? { ...pp, value: v } : pp)));
        });
      })
      .filter(Boolean);

    // Set initial values for output ports
    circuit.ports
      .filter((p) => p.type === "OUT")
      .forEach((p) => {
        const out$ = circuitInstance.outputs[p.id];
        if (out$) {
          setPorts((prev) => prev.map((pp) => (pp.id === p.id ? { ...pp, value: out$.value } : pp)));
        }
      });

    return () => subs.forEach((s) => s?.unsubscribe());
  }, [circuitInstance, circuit.ports]);

  // Handle user input click
  const handlePortClick = useCallback(
    (port: PortType) => {
      console.log("handlePortClick", port);
      if (port.type !== "IN") return;
      const nextVal = !port.value;
      console.log("Setting input", port.id, "to", nextVal);
      const subj = circuitInstance.inputs[port.id];
      if (subj) {
        subj.next(nextVal);
        console.log("Input subject updated");
      } else {
        console.error("No input subject found for", port.id);
      }
      setPorts((prev) => prev.map((p) => (p.id === port.id ? { ...p, value: nextVal } : p)));
    },
    [circuitInstance],
  );

  const inputPorts: PortType[] = [];
  const outputPorts: PortType[] = [];
  ports.forEach((port) => {
    if (port.type === "IN") inputPorts.push(port);
    else outputPorts.push(port);
  });

  return (
    <div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-3 w-fit">
      <div className="text-center font-semibold">{circuit.name}</div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          {inputPorts.map((port) => (
            <Port key={port.id} port={port} onClick={handlePortClick} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {outputPorts.map((port) => (
            <Port key={port.id} port={port} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Port({ port, onClick }: { port: PortType; onClick?: (port: PortType) => void }) {
  return (
    <button
      onClick={() => onClick?.(port)}
      disabled={port.type === "OUT"}
      className="text-sm"
      style={{
        backgroundColor: port.value ? "tomato" : "gray",
        cursor: port.type === "OUT" ? "default" : "pointer",
      }}
    >
      {port.name}
    </button>
  );
}
