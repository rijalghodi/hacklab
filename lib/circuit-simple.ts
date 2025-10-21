/**
 * Simple circuit simulation using pure functional approach
 * No subscriptions, no reactive patterns - just pure computation
 */

import { logger } from "./logger";
import { CircuitChip, NAND_CHIP_TYPE, PortType } from "./types/chips";

/**
 * Simple circuit class that builds a memoized evaluation function
 * Takes inputs and returns outputs synchronously
 */
export class CircuitSimple {
  private evaluationFunction: (inputs: Record<string, boolean>) => Record<string, boolean>;
  private inputPortIds: string[];
  private outputPortIds: string[];

  constructor(private circuitDef: CircuitChip) {
    this.inputPortIds = this.getInputPortIds();
    this.outputPortIds = this.getOutputPortIds();
    this.evaluationFunction = this.buildEvaluationFunction();
  }

  /**
   * Evaluate the circuit with given input values
   * Returns output port values synchronously
   */
  evaluate(inputs: Record<string, boolean>): Record<string, boolean> {
    return this.evaluationFunction(inputs);
  }

  /**
   * Get input port IDs for this circuit
   */
  private getInputPortIds(): string[] {
    return (this.circuitDef.ports || []).filter((port) => port.type === PortType.IN).map((port) => port.id);
  }

  /**
   * Get output port IDs for this circuit
   */
  private getOutputPortIds(): string[] {
    return (this.circuitDef.ports || []).filter((port) => port.type === PortType.OUT).map((port) => port.id);
  }

  /**
   * Build the memoized evaluation function
   * This function is built once and can be called repeatedly
   */
  private buildEvaluationFunction(): (inputs: Record<string, boolean>) => Record<string, boolean> {
    // Handle primitive NAND gate (base case)
    if (this.circuitDef.chipType === NAND_CHIP_TYPE) {
      return this.buildNandEvaluationFunction();
    }

    // Handle composite circuits
    return this.buildCompositeEvaluationFunction();
  }

  /**
   * Build evaluation function for primitive NAND gate
   */
  private buildNandEvaluationFunction(): (inputs: Record<string, boolean>) => Record<string, boolean> {
    return (inputs: Record<string, boolean>) => {
      const inputValues = this.inputPortIds.map((id) => inputs[id] || false);

      // NAND logic: !(a && b)
      const result = !(inputValues[0] && inputValues[1]);

      const outputs: Record<string, boolean> = {};
      this.outputPortIds.forEach((id, index) => {
        outputs[id] = index === 0 ? result : false;
      });

      return outputs;
    };
  }

  /**
   * Build evaluation function for composite circuits
   */
  private buildCompositeEvaluationFunction(): (inputs: Record<string, boolean>) => Record<string, boolean> {
    // Build internal chip evaluation functions
    const chipEvaluators: Record<string, (inputs: Record<string, boolean>) => Record<string, boolean>> = {};

    for (const chip of this.circuitDef.chips || []) {
      // Handle primitive NAND gates
      if (chip.chipType === NAND_CHIP_TYPE) {
        chipEvaluators[chip.id] = (chipInputs: Record<string, boolean>) => {
          const inputValues = Object.values(chipInputs);
          const result = !(inputValues[0] && inputValues[1]);
          return { "nand.port-out": result };
        };
        continue;
      }

      // Handle composite gates recursively
      const subDef = this.circuitDef.definitions?.find((d) => d.chipType === chip.chipType);
      if (!subDef) {
        throw new Error(`Missing definition for chip '${chip.chipType}'`);
      }

      // Create sub-circuit evaluator
      const subCircuit = new CircuitSimple({ ...subDef, definitions: this.circuitDef.definitions });
      chipEvaluators[chip.id] = (chipInputs: Record<string, boolean>) => {
        return subCircuit.evaluate(chipInputs);
      };
    }

    return (inputs: Record<string, boolean>) => {
      // Initialize all internal values
      // const chipValues: Record<string, Record<string, boolean>> = {};
      const chipValues: Record<string, Record<string, boolean>> = {};
      logger.debug({ group: "CircuitSimple", message: `Initial chip values`, data: { chipValues: chipValues } });

      const ports = this.circuitDef.ports || [];
      const portValuesInitial: Record<string, boolean> = Object.fromEntries(ports.map((port) => [port.id, false]));
      logger.debug({ group: "CircuitSimple", message: `Initial port values initial`, data: portValuesInitial });
      const portValues: Record<string, boolean> = { ...portValuesInitial, ...inputs };

      logger.debug({ group: "CircuitSimple", message: `Initial port values`, data: portValues });

      // Initialize chip values
      for (const chip of this.circuitDef.chips || []) {
        // chipValues[chip.id] = {};
        chipValues[chip.id] = {};
      }

      logger.debug({
        group: "CircuitSimple",
        message: `After initializing chip values`,
        data: { chipValues: chipValues, this: this.circuitDef.chips },
      });

      // Process wires to propagate values
      for (const wire of this.circuitDef.wires || []) {
        // Get source value
        let sourceValue: boolean;

        if (portValues[wire.sourceId] !== undefined) {
          // Source is a top-level port
          sourceValue = portValues[wire.sourceId];
          logger.debug({
            group: "CircuitSimple",
            message: `Source ${wire.sourceId} is a top-level port`,
            data: { wire, portValues, sourceValue },
          });
        } else if (chipValues[wire.sourceId] !== undefined && wire.sourcePortId) {
          // Source is from a chip output
          sourceValue = chipValues[wire.sourceId][wire.sourcePortId];
          logger.debug({
            group: "CircuitSimple",
            message: `Source ${wire.sourceId}.${wire.sourcePortId} is from a chip output`,
            data: { wire, chipValues: chipValues, sourceValue },
          });
        } else {
          logger.error({
            group: "CircuitSimple",
            message: `Invalid source sourceId: ${wire.sourceId} sourcePortId: ${wire.sourcePortId}`,
            data: { wire, portValues, chipValues: chipValues },
          });
          throw new Error(`Invalid source: ${wire.sourceId}`);
        }

        // Set target value
        if (portValues[wire.targetId] !== undefined) {
          // Target is a top-level port
          portValues[wire.targetId] = sourceValue;
          logger.debug({
            group: "CircuitSimple",
            message: `Target ${wire.targetId} is a top-level port`,
            data: { wire, portValues, sourceValue },
          });
        } else if (chipValues[wire.targetId] !== undefined && wire.targetPortId) {
          // Target is a chip input
          chipValues[wire.targetId][wire.targetPortId] = sourceValue;
          logger.debug({
            group: "CircuitSimple",
            message: `Target ${wire.targetId}.${wire.targetPortId} is a chip input`,
            data: { wire, chipValues: chipValues, sourceValue },
          });
        } else {
          logger.error({
            group: "CircuitSimple",
            message: `Invalid target targetId: ${wire.targetId} targetPortId: ${wire.targetPortId}`,
            data: { wire, portValues, chipValues: chipValues },
          });
          throw new Error(`Invalid target: ${wire.targetId}`);
        }
      }

      logger.debug({
        group: "CircuitSimple",
        message: `Before evaluating chips`,
        data: { portValues, chipValues: chipValues },
      });

      // Evaluate all chips
      for (const chip of this.circuitDef.chips || []) {
        const chipInputs: Record<string, boolean> = {};

        // Collect chip inputs from wires
        for (const wire of this.circuitDef.wires || []) {
          if (wire.targetId === chip.id && wire.targetPortId) {
            // Get the value that was propagated to this chip input
            chipInputs[wire.targetPortId] = chipValues[chip.id][wire.targetPortId] || false;
          }
        }

        // Evaluate chip and preserve input values
        const chipOutputs = chipEvaluators[chip.id](chipInputs);
        chipValues[chip.id] = { ...chipValues[chip.id], ...chipOutputs };
        logger.debug({
          group: "CircuitSimple",
          message: `Evaluated chip ${chip.id}`,
          data: { inputs: chipInputs, outputs: chipOutputs, chipValues },
        });
      }

      logger.info({ group: "CircuitSimple", message: `After evaluating chips`, data: { chipValues: chipValues } });

      // Collect final output values
      const outputs: Record<string, boolean> = {};

      for (const portId of this.outputPortIds) {
        logger.info({
          group: "CircuitSimple",
          message: `Collecting final output values for port ${portId}`,
          data: { portId, wires: this.circuitDef.wires },
        });
        // find wire that connects to portId
        const outWires = this.circuitDef.wires?.filter((wire) => wire.targetId === portId);
        if (!outWires || outWires.length === 0) {
          logger.error({
            group: "CircuitSimple",
            message: `Cannot find wire for output port ${portId}`,
            data: { portId, wires: this.circuitDef.wires },
          });
          throw new Error(`Cannot find wire for output port ${portId}`);
        }

        logger.info({
          group: "CircuitSimple",
          message: `Found ${outWires.length} wires for output port ${portId}`,
          data: { outWires },
        });

        // Output might come from a chip output
        for (const wire of outWires) {
          logger.debug({
            group: "CircuitSimple",
            message: `Checking wire for output port ${portId}`,
            data: { wire, chipValues: chipValues, portValues, portId },
          });
          if (
            wire.sourceId &&
            wire.sourcePortId &&
            wire.targetPortId === portId &&
            chipValues[wire.sourceId] != undefined
          ) {
            logger.debug({
              group: "CircuitSimple",
              message: `Output port ${portId} is from chip ${wire.sourceId}`,
              data: chipValues[wire.sourceId][wire.sourcePortId],
            });
            outputs[portId] = chipValues[wire.sourceId][wire.sourcePortId] || false;
            break;
          } else if (portValues[wire.sourceId] !== undefined) {
            logger.debug({
              group: "CircuitSimple",
              message: `Output port ${portId} is from top-level port ${wire.sourceId}`,
              data: portValues[wire.sourceId],
            });
            outputs[portId] = portValues[wire.sourceId] || false;
            break;
          } else {
            logger.error({
              group: "CircuitSimple",
              message: `Cannot find source for output port ${portId}`,
              data: { wire, chipValues: chipValues },
            });
            throw new Error(`Cannot find source for output port ${portId}`);
          }
        }
      }

      logger.info({ group: "CircuitSimple", message: `Final outputs`, data: { outputs } });

      return outputs;
    };
  }

  /**
   * Get input port IDs (public access)
   */
  get inputPorts(): string[] {
    return [...this.inputPortIds];
  }

  /**
   * Get output port IDs (public access)
   */
  get outputPorts(): string[] {
    return [...this.outputPortIds];
  }
}
