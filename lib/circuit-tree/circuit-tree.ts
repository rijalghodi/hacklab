import { CircuitChip, CircuitTreeNode, Port, PortType } from "@/lib/types";

import { calculateTree, PassedValue } from "./calculate-tree";
import { convertCircuitToTree } from "./circuit-to-tree";

type TruthTable = Map<string, PassedValue>;

export class CircuitTree {
  private tree: CircuitTreeNode[];
  private truthTable: TruthTable = new Map();
  private inputPorts: Port[] = [];
  private outputPorts: Port[] = [];
  private inputPortCount: number;
  private outputPortCount: number;
  private definitions: CircuitChip[];

  constructor(circuit: CircuitChip) {
    this.tree = convertCircuitToTree(circuit);
    this.truthTable = new Map();

    const ports = circuit.ports || [];
    const inputPorts: Port[] = [];
    const outputPorts: Port[] = [];

    for (const port of ports) {
      if (port.type === PortType.IN) {
        inputPorts.push(port);
      } else if (port.type === PortType.OUT) {
        outputPorts.push(port);
      }
    }

    this.inputPorts = inputPorts;
    this.outputPorts = outputPorts;
    this.definitions = circuit.definitions || [];
    this.inputPortCount = inputPorts.length;
    this.outputPortCount = outputPorts.length;
  }

  public calculateTree(inputValues: PassedValue): PassedValue {
    if (!this.isValidInputValues(inputValues)) {
      throw new Error(`Invalid input values`);
    }

    // get from cache
    const truthTableKey = this.createTruthTableKey(inputValues);
    const cachedResult = this.truthTable.get(truthTableKey);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const [outputValues] = calculateTree(this.tree, inputValues);
    this.cacheValues(inputValues, outputValues);
    return outputValues;
  }

  private createTruthTableKey(inputValues: PassedValue): string {
    const entries = Object.entries(inputValues);
    // sort entries by key
    entries.sort((a, b) => a[0].localeCompare(b[0]));

    return entries.map(([_, value]) => `${value ? "1" : "0"}`).join("");
  }

  private isValidInputValues(inputValues: PassedValue): boolean {
    // validate input values - length must be equal to the number of input ports
    if (Object.keys(inputValues).length !== this.inputPortCount) {
      return false;
    }

    // all input ports must be present in the input values
    for (let i = 0; i < this.inputPortCount; i++) {
      if (inputValues[this.inputPorts[i].id] === undefined) {
        return false;
      }
    }

    return true;
  }

  private isValidOutputValues(outputValues: PassedValue): boolean {
    // validate output values - length must be equal to the number of output ports
    if (Object.keys(outputValues).length !== this.outputPortCount) {
      return false;
    }

    // all output ports must be present in the output values
    for (let i = 0; i < this.outputPortCount; i++) {
      if (outputValues[this.outputPorts[i].id] === undefined) {
        return false;
      }
    }

    return true;
  }

  private cacheValues(inputValues: PassedValue, outputValues: PassedValue) {
    if (!this.isValidInputValues(inputValues)) {
      throw new Error(`Invalid input values`);
    }

    if (!this.isValidOutputValues(outputValues)) {
      throw new Error(`Invalid output values`);
    }

    const truthTableKey = this.createTruthTableKey(inputValues);

    // prevent re-caching the same truth table key
    if (this.truthTable.has(truthTableKey)) {
      return;
    }

    this.truthTable.set(truthTableKey, outputValues);
  }

  public getCacheSize(): number {
    return this.truthTable.size;
  }

  public getCacheEntries(): Array<[string, PassedValue]> {
    return Array.from(this.truthTable.entries());
  }

  public clearCache(): void {
    this.truthTable.clear();
  }
}
