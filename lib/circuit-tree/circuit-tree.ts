import { CircuitChip, CircuitChipDefinition, CircuitTreeNode } from "@/lib/types";

import { convertCircuitToTree } from "./circuit-to-tree";

export class CircuitTree {
  private circuit: CircuitChipDefinition;
  private tree: CircuitTreeNode[];
  private definitions: CircuitChipDefinition[];

  constructor(circuit: CircuitChipDefinition, definitions: CircuitChipDefinition[]) {
    this.circuit = circuit;
    this.definitions = definitions;
    // TODO: Move logic from convertCircuitToTree to here. Use this.
    // Convert CircuitChipDefinition to CircuitChip for the function call
    const circuitChip: CircuitChip = {
      ...circuit,
      id: circuit.chipType, // Use chipType as id for CircuitChip
      definitions: definitions,
    };
    this.tree = convertCircuitToTree(circuitChip, null);
  }

  public getTree(): CircuitTreeNode[] {
    return this.tree;
  }
}
