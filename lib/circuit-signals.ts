/**
 * High-performance custom signal implementation for circuit simulation
 * Alternative to BehaviorSubject with better performance characteristics
 */

export class CircuitSignal {
  private _value: boolean;
  private listeners: Set<(value: boolean) => void> = new Set();
  private readonly id: string;

  constructor(initialValue: boolean = false, id?: string) {
    this._value = initialValue;
    this.id = id || `signal_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current signal value
   */
  get value(): boolean {
    return this._value;
  }

  /**
   * Set signal value and notify all listeners
   */
  set value(newValue: boolean) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to value changes
   * @param listener Function to call when value changes
   * @returns Unsubscribe function
   */
  subscribe(listener: (value: boolean) => void): () => void {
    this.listeners.add(listener);

    // Immediately call with current value (like BehaviorSubject)
    listener(this._value);

    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of current value
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this._value);
      } catch (error) {
        console.error(`Error in signal listener for ${this.id}:`, error);
      }
    });
  }

  /**
   * Get signal ID for debugging
   */
  get signalId(): string {
    return this.id;
  }

  /**
   * Get number of active listeners
   */
  get listenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Circuit port that can be connected to other ports
 */
export class CircuitPort extends CircuitSignal {
  private connections: Set<CircuitPort> = new Set();

  constructor(initialValue: boolean = false, id?: string) {
    super(initialValue, id);

    // Auto-propagate to connected ports
    this.subscribe((value) => {
      this.connections.forEach((port) => {
        if (port.value !== value) {
          port.value = value;
        }
      });
    });
  }

  /**
   * Connect this port to another port
   */
  connect(target: CircuitPort): void {
    this.connections.add(target);
    // Immediately propagate current value
    if (target.value !== this.value) {
      target.value = this.value;
    }
  }

  /**
   * Disconnect from a port
   */
  disconnect(target: CircuitPort): void {
    this.connections.delete(target);
  }

  /**
   * Disconnect from all ports
   */
  disconnectAll(): void {
    this.connections.clear();
  }

  /**
   * Get connected ports
   */
  get connectedPorts(): CircuitPort[] {
    return Array.from(this.connections);
  }
}

/**
 * Logic gate implementation using custom signals
 */
export class LogicGate {
  protected inputs: CircuitPort[] = [];
  protected outputs: CircuitPort[] = [];
  protected subscriptions: (() => void)[] = [];

  constructor(
    protected operation: (inputs: boolean[]) => boolean,
    inputCount: number,
    outputCount: number = 1,
  ) {
    // Create input ports
    for (let i = 0; i < inputCount; i++) {
      this.inputs.push(new CircuitPort(false, `input_${i}`));
    }

    // Create output ports
    for (let i = 0; i < outputCount; i++) {
      this.outputs.push(new CircuitPort(false, `output_${i}`));
    }

    this.setupLogic();
  }

  /**
   * Setup the logic connections
   */
  protected setupLogic(): void {
    // Subscribe to all input changes
    this.inputs.forEach((input, _) => {
      const unsubscribe = input.subscribe(() => {
        this.updateOutputs();
      });
      this.subscriptions.push(unsubscribe);
    });
  }

  /**
   * Update output values based on current inputs
   */
  protected updateOutputs(): void {
    const inputValues = this.inputs.map((input) => input.value);
    const result = this.operation(inputValues);

    this.outputs.forEach((output) => {
      if (output.value !== result) {
        output.value = result;
      }
    });
  }

  /**
   * Get input port by index
   */
  getInput(index: number): CircuitPort {
    return this.inputs[index];
  }

  /**
   * Get output port by index
   */
  getOutput(index: number): CircuitPort {
    return this.outputs[index];
  }

  /**
   * Clean up subscriptions
   */
  destroy(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions = [];
    this.inputs.forEach((input) => input.clearListeners());
    this.outputs.forEach((output) => output.clearListeners());
  }
}

/**
 * Predefined logic gates
 */
export const Gates = {
  NAND: () => new LogicGate((inputs) => !(inputs[0] && inputs[1]), 2),
  AND: () => new LogicGate((inputs) => inputs[0] && inputs[1], 2),
  OR: () => new LogicGate((inputs) => inputs[0] || inputs[1], 2),
  NOT: () => new LogicGate((inputs) => !inputs[0], 1),
  XOR: () => new LogicGate((inputs) => inputs[0] !== inputs[1], 2),
  NOR: () => new LogicGate((inputs) => !(inputs[0] || inputs[1]), 2),
};
