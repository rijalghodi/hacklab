import { ChipName, Circuit, NodeType } from "./types/flow";

/**
 * Represents a reactive node that can handle different chip types (NAND, AND, NOT)
 * and automatically updates its output when inputs change.
 */
export class Node {
  private _name: string;
  private _type: NodeType;
  private _definition: Circuit | null = null;
  private _inputs: Map<string, boolean> = new Map();
  private _outputs: Map<string, boolean> = new Map();
  private _inputNodes: Map<string, Node> = new Map();
  private _outputNodes: Map<string, Node[]> = new Map();
  private _listeners: Set<() => void> = new Set();

  constructor(name: string, type: NodeType, definition?: Circuit) {
    this._name = name;
    this._type = type;
    this._definition = definition || null;

    // Initialize based on type
    this.initializeNode();
  }

  /**
   * Initialize the node based on its type
   */
  private initializeNode(): void {
    switch (this._type) {
      case NodeType.IN:
        this.initializeInputNode();
        break;
      case NodeType.OUT:
        this.initializeOutputNode();
        break;
      case NodeType.CHIP:
        this.initializeChipNode();
        break;
    }
  }

  /**
   * Initialize input node
   */
  private initializeInputNode(): void {
    this._outputs.set(this._name, false);
  }

  /**
   * Initialize output node
   */
  private initializeOutputNode(): void {
    // Output nodes don't have direct outputs, they depend on connected nodes
  }

  /**
   * Initialize chip node based on definition
   */
  private initializeChipNode(): void {
    if (!this._definition) {
      throw new Error(`Definition required for chip node: ${this._name}`);
    }

    // Initialize input ports
    const inputPorts = this._definition.nodes.filter((node) => node.type === NodeType.IN);
    inputPorts.forEach((port) => {
      this._inputs.set(port.name, false);
    });

    // Initialize output ports
    const outputPorts = this._definition.nodes.filter((node) => node.type === NodeType.OUT);
    outputPorts.forEach((port) => {
      this._outputs.set(port.name, false);
    });
  }

  /**
   * Set input value for a specific port
   */
  setInput(portName: string, value: boolean): void {
    if (!this._inputs.has(portName)) {
      throw new Error(`Input port '${portName}' not found in node '${this._name}'`);
    }

    const oldValue = this._inputs.get(portName);
    this._inputs.set(portName, value);

    // Only update if value changed
    if (oldValue !== value) {
      this.updateOutputs();
      this.notifyListeners();
    }
  }

  /**
   * Set input node connection
   */
  setInputNode(portName: string, node: Node): void {
    this._inputNodes.set(portName, node);

    // Listen to the input node's changes
    node.addListener(() => {
      this.updateOutputs();
      this.notifyListeners();
    });

    // Initial update
    this.updateOutputs();
  }

  /**
   * Connect output to another node
   */
  connectOutput(portName: string, targetNode: Node): void {
    if (!this._outputNodes.has(portName)) {
      this._outputNodes.set(portName, []);
    }
    this._outputNodes.get(portName)!.push(targetNode);
  }

  /**
   * Get output value for a specific port
   */
  getOutput(portName: string): boolean {
    if (!this._outputs.has(portName)) {
      throw new Error(`Output port '${portName}' not found in node '${this._name}'`);
    }
    return this._outputs.get(portName)!;
  }

  /**
   * Get all outputs
   */
  getAllOutputs(): Map<string, boolean> {
    return new Map(this._outputs);
  }

  /**
   * Add listener for changes
   */
  addListener(listener: () => void): void {
    this._listeners.add(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: () => void): void {
    this._listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this._listeners.forEach((listener) => listener());
  }

  /**
   * Update outputs based on current inputs and node type
   */
  private updateOutputs(): void {
    switch (this._type) {
      case NodeType.IN:
        this.updateInputNodeOutputs();
        break;
      case NodeType.OUT:
        this.updateOutputNodeOutputs();
        break;
      case NodeType.CHIP:
        this.updateChipNodeOutputs();
        break;
    }
  }

  /**
   * Update outputs for input nodes
   */
  private updateInputNodeOutputs(): void {
    // For input nodes, output equals the input value
    const inputValue = this._inputs.get(this._name) || false;
    this._outputs.set(this._name, inputValue);
  }

  /**
   * Update outputs for output nodes
   */
  private updateOutputNodeOutputs(): void {
    // Output nodes pass through their input values
    // This is handled by the connected input nodes
  }

  /**
   * Update outputs for chip nodes
   */
  private updateChipNodeOutputs(): void {
    if (!this._definition) return;

    switch (this._name) {
      case ChipName.NAND:
        this.updateNandOutputs();
        break;
      case "NOT":
        this.updateNotOutputs();
        break;
      case "AND":
        this.updateAndOutputs();
        break;
      default:
        this.updateCustomChipOutputs();
        break;
    }
  }

  /**
   * Update outputs for NAND gate
   */
  private updateNandOutputs(): void {
    const a = this._inputs.get("a") || false;
    const b = this._inputs.get("b") || false;
    const result = !(a && b);
    this._outputs.set("out", result);
  }

  /**
   * Update outputs for NOT gate (implemented using NAND)
   */
  private updateNotOutputs(): void {
    const input = this._inputs.get("in") || false;
    // NOT is implemented as NAND(input, input)
    const result = !(input && input);
    this._outputs.set("out", result);
  }

  /**
   * Update outputs for AND gate (implemented using NAND + NOT)
   */
  private updateAndOutputs(): void {
    const a = this._inputs.get("a") || false;
    const b = this._inputs.get("b") || false;
    // AND is implemented as NOT(NAND(a, b))
    const nandResult = !(a && b);
    const result = !nandResult;
    this._outputs.set("out", result);
  }

  /**
   * Update outputs for custom chips based on their definition
   */
  private updateCustomChipOutputs(): void {
    if (!this._definition) return;

    // For custom chips, we need to evaluate the circuit
    // This is a simplified version - in practice, you'd want to build
    // the internal circuit and evaluate it
    const outputPorts = this._definition.nodes.filter((node) => node.type === NodeType.OUT);

    outputPorts.forEach((outputPort) => {
      // For now, set a default value
      // In a full implementation, you'd evaluate the circuit here
      this._outputs.set(outputPort.name, false);
    });
  }

  /**
   * Get node name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get node type
   */
  get type(): NodeType {
    return this._type;
  }

  /**
   * Get node definition
   */
  get definition(): Circuit | null {
    return this._definition;
  }

  /**
   * Get all inputs
   */
  get inputs(): Map<string, boolean> {
    return new Map(this._inputs);
  }

  /**
   * Get all outputs
   */
  get outputs(): Map<string, boolean> {
    return new Map(this._outputs);
  }

  /**
   * Create a factory method for common node types
   */
  static createInputNode(name: string): Node {
    return new Node(name, NodeType.IN);
  }

  static createOutputNode(name: string): Node {
    return new Node(name, NodeType.OUT);
  }

  static createNandNode(name: string = "NAND"): Node {
    const nandDefinition: Circuit = {
      type: NodeType.CHIP,
      name: ChipName.NAND,
      nodes: [
        { type: NodeType.IN, name: "a", id: "a" },
        { type: NodeType.IN, name: "b", id: "b" },
        { type: NodeType.OUT, name: "out", id: "out" },
      ],
      edges: [],
    };
    return new Node(name, NodeType.CHIP, nandDefinition);
  }

  static createNotNode(name: string = "NOT"): Node {
    const notDefinition: Circuit = {
      type: NodeType.CHIP,
      name: "NOT",
      nodes: [
        { type: NodeType.IN, name: "in", id: "in" },
        { type: NodeType.OUT, name: "out", id: "out" },
      ],
      edges: [],
    };
    return new Node(name, NodeType.CHIP, notDefinition);
  }

  static createAndNode(name: string = "AND"): Node {
    const andDefinition: Circuit = {
      type: NodeType.CHIP,
      name: "AND",
      nodes: [
        { type: NodeType.IN, name: "a", id: "a" },
        { type: NodeType.IN, name: "b", id: "b" },
        { type: NodeType.OUT, name: "out", id: "out" },
      ],
      edges: [],
    };
    return new Node(name, NodeType.CHIP, andDefinition);
  }

  /**
   * Create a node from a circuit definition
   */
  static fromCircuit(circuit: Circuit): Node {
    return new Node(circuit.name, circuit.type, circuit);
  }
}
