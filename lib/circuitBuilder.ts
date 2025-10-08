import { BehaviorSubject, combineLatest, map } from "rxjs";

import type { CircuitChip } from "./types/chips";

/** Base library of primitive gates */
const baseLibrary: Record<
  string,
  () => {
    inputs: Record<string, BehaviorSubject<boolean>>;
    outputs: Record<string, BehaviorSubject<boolean>>;
  }
> = {
  NAND: () => {
    const a$ = new BehaviorSubject(false);
    const b$ = new BehaviorSubject(false);
    const out$ = new BehaviorSubject(true);

    combineLatest([a$, b$])
      .pipe(map(([a, b]) => !(a && b)))
      .subscribe(out$);

    return {
      inputs: {
        "nand.port-a": a$,
        "nand.port-b": b$,
      },
      outputs: {
        "nand.port-out": out$,
      },
    };
  },
};

/** Recursively build circuit */
export function buildCircuit(def: CircuitChip): {
  inputs: Record<string, BehaviorSubject<boolean>>;
  outputs: Record<string, BehaviorSubject<boolean>>;
} {
  const inputs: Record<string, BehaviorSubject<boolean>> = {};
  const outputs: Record<string, BehaviorSubject<boolean>> = {};

  // Create top-level port subjects
  for (const p of def.ports) {
    const subj = new BehaviorSubject(p.value ?? false);
    if (p.type === "IN") inputs[p.id] = subj;
    else outputs[p.id] = subj;
  }

  // Instantiate sub-chips
  const chips: Record<string, ReturnType<typeof buildCircuit>> = {};
  for (const chip of def.chips) {
    // base gate
    const base = baseLibrary[chip.name];
    if (base) {
      chips[chip.id] = base();
      continue;
    }

    // composite gate
    const subDef = def.definitions.find((d) => d.name === chip.name);
    if (!subDef) throw new Error(`Missing definition for ${chip.name}`);
    chips[chip.id] = buildCircuit(subDef);
  }

  // Connect wires
  for (const w of def.wires) {
    console.log("Connecting wire:", w);

    // Source - can be from top-level output port or chip output
    let src$: BehaviorSubject<boolean> | undefined;
    if (outputs[w.sourceId]) {
      src$ = outputs[w.sourceId];
      console.log("Source from top-level output:", w.sourceId);
    } else if (chips[w.sourceId] && w.sourcePortId) {
      src$ = chips[w.sourceId].outputs[w.sourcePortId];
      console.log("Source from chip output:", w.sourceId, w.sourcePortId);
    } else if (inputs[w.sourceId]) {
      src$ = inputs[w.sourceId];
      console.log("Source from top-level input:", w.sourceId);
    }
    if (!src$) throw new Error(`Invalid source: ${w.sourceId}`);

    // Target - can be to top-level input port or chip input
    let tgt$: BehaviorSubject<boolean> | undefined;
    if (inputs[w.targetId]) {
      tgt$ = inputs[w.targetId];
      console.log("Target to top-level input:", w.targetId);
    } else if (chips[w.targetId] && w.targetPortId) {
      tgt$ = chips[w.targetId].inputs[w.targetPortId];
      console.log("Target to chip input:", w.targetId, w.targetPortId);
    } else if (outputs[w.targetId]) {
      tgt$ = outputs[w.targetId];
      console.log("Target to top-level output:", w.targetId);
    }
    if (!tgt$) throw new Error(`Invalid target: ${w.targetId}`);

    console.log("Connecting", w.sourceId, "->", w.targetId);
    src$.subscribe((v) => {
      console.log("Wire propagating:", w.sourceId, "->", w.targetId, "value:", v);
      tgt$.next(v);
    });
  }

  return { inputs, outputs };
}
