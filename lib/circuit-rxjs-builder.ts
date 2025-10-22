import { BehaviorSubject, combineLatest, map } from "rxjs";

import { logger } from "./logger";
import { CircuitChip, NAND_CHIP_TYPE, PortType } from "./types/chips";

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
export function buildRxjsCircuit(def: CircuitChip): {
  inputs: Record<string, BehaviorSubject<boolean>>;
  outputs: Record<string, BehaviorSubject<boolean>>;
} {
  if (def.chipType === NAND_CHIP_TYPE) {
    const nand = baseLibrary["NAND"]();
    return nand;
  }

  const inputs: Record<string, BehaviorSubject<boolean>> = {};
  const outputs: Record<string, BehaviorSubject<boolean>> = {};

  // Create top-level port subjects
  for (const p of def.ports || []) {
    const subj = new BehaviorSubject(p.value ?? false);
    if (p.type === PortType.IN) inputs[p.id] = subj;
    else outputs[p.id] = subj;
  }

  // Instantiate sub-chips
  const chips: Record<string, ReturnType<typeof buildRxjsCircuit>> = {};
  for (const chip of def.chips || []) {
    // base gate
    const base = baseLibrary[chip.chipType];
    if (base) {
      chips[chip.id] = base();
      continue;
    }

    // composite gate
    const subDef = def.definitions?.find((d) => d.chipType === chip.chipType);
    if (!subDef) throw new Error(`Missing definition for chip '${chip.chipType}'`);
    // pass definitions to sub-chips to provide access to all chips
    chips[chip.id] = buildRxjsCircuit({ ...subDef, id: chip.id, definitions: def.definitions });
  }

  // Connect wires
  for (const w of def.wires || []) {
    logger.info({ group: "buildRxjsCircuit", message: `Connecting wire: ${w.sourceId} -> ${w.targetId}` });

    // Source - can be from top-level output port or chip output
    let src$: BehaviorSubject<boolean> | undefined;
    if (outputs[w.sourceId]) {
      src$ = outputs[w.sourceId];
      logger.debug({ group: "buildRxjsCircuit", message: `Source from top-level output: ${w.sourceId}` });
    } else if (chips[w.sourceId] && w.sourcePortId) {
      src$ = chips[w.sourceId].outputs[w.sourcePortId];
      logger.debug({ group: "buildRxjsCircuit", message: `Source from chip output: ${w.sourceId}.${w.sourcePortId}` });
    } else if (inputs[w.sourceId]) {
      src$ = inputs[w.sourceId];
      logger.debug({ group: "buildRxjsCircuit", message: `Source from top-level input: ${w.sourceId}` });
    }
    if (!src$) throw new Error(`Invalid source: ${w.sourceId}`);

    // Target - can be to top-level input port or chip input
    let tgt$: BehaviorSubject<boolean> | undefined;
    if (inputs[w.targetId]) {
      tgt$ = inputs[w.targetId];
      logger.debug({ group: "buildRxjsCircuit", message: `Target to top-level input: ${w.targetId}` });
    } else if (chips[w.targetId] && w.targetPortId) {
      tgt$ = chips[w.targetId].inputs[w.targetPortId];
      logger.debug({ group: "buildRxjsCircuit", message: `Target to chip input: ${w.targetId}.${w.targetPortId}` });
    } else if (outputs[w.targetId]) {
      tgt$ = outputs[w.targetId];
      logger.debug({ group: "buildRxjsCircuit", message: `Target to top-level output: ${w.targetId}` });
    }
    if (!tgt$) throw new Error(`Invalid target: ${w.targetId}`);

    logger.info({ group: "buildRxjsCircuit", message: `Connecting ${w.sourceId} -> ${w.targetId}` });
    src$.subscribe((v) => {
      logger.debug({
        group: "buildRxjsCircuit",
        message: `Wire propagating: ${w.sourceId} -> ${w.targetId}, value: ${v}`,
      });
      tgt$.next(v);
    });
  }

  return { inputs, outputs };
}
