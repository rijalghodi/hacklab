import { Node } from "./flow-class";

/**
 * Example usage of the reactive Node class
 * This demonstrates how to create and connect nodes for different logic gates
 */

// Example 1: Simple NAND gate
console.log("=== Example 1: NAND Gate ===");
const nandGate = Node.createNandNode("NAND1");

// Set inputs
nandGate.setInput("a", true);
nandGate.setInput("b", false);

// Get output
console.log(`NAND(true, false) = ${nandGate.getOutput("out")}`); // Should be true

// Change inputs and see reactive update
nandGate.setInput("a", true);
nandGate.setInput("b", true);
console.log(`NAND(true, true) = ${nandGate.getOutput("out")}`); // Should be false

// Example 2: NOT gate (implemented using NAND)
console.log("\n=== Example 2: NOT Gate ===");
const notGate = Node.createNotNode("NOT1");

notGate.setInput("in", true);
console.log(`NOT(true) = ${notGate.getOutput("out")}`); // Should be false

notGate.setInput("in", false);
console.log(`NOT(false) = ${notGate.getOutput("out")}`); // Should be true

// Example 3: AND gate (implemented using NAND + NOT)
console.log("\n=== Example 3: AND Gate ===");
const andGate = Node.createAndNode("AND1");

andGate.setInput("a", true);
andGate.setInput("b", true);
console.log(`AND(true, true) = ${andGate.getOutput("out")}`); // Should be true

andGate.setInput("a", true);
andGate.setInput("b", false);
console.log(`AND(true, false) = ${andGate.getOutput("out")}`); // Should be false

// Example 4: Input and Output nodes
console.log("\n=== Example 4: Input/Output Nodes ===");
const inputNode = Node.createInputNode("input1");
const outputNode = Node.createOutputNode("output1");

// Set input value
inputNode.setInput("input1", true);
console.log(`Input value: ${inputNode.getOutput("input1")}`); // Should be true

// Example 5: Reactive behavior with listeners
console.log("\n=== Example 5: Reactive Behavior ===");
const reactiveNand = Node.createNandNode("ReactiveNAND");

// Add a listener to track changes
reactiveNand.addListener(() => {
  console.log(`NAND output changed to: ${reactiveNand.getOutput("out")}`);
});

// Change inputs - listener will be triggered
reactiveNand.setInput("a", false);
reactiveNand.setInput("b", false);
reactiveNand.setInput("a", true);

// Example 6: Complex circuit simulation
console.log("\n=== Example 6: Complex Circuit (AND using NAND + NOT) ===");
const circuitNand = Node.createNandNode("CircuitNAND");
const circuitNot = Node.createNotNode("CircuitNOT");
const circuitOutput = Node.createOutputNode("CircuitOutput");

// Connect the circuit: NAND -> NOT -> Output
circuitNot.setInputNode("in", circuitNand);
circuitOutput.setInputNode("in", circuitNot);

// Set inputs to the NAND gate
circuitNand.setInput("a", true);
circuitNand.setInput("b", true);

// The output should be true (AND logic)
console.log(`Circuit output: ${circuitNot.getOutput("out")}`); // Should be true

// Change inputs
circuitNand.setInput("a", false);
console.log(`Circuit output after change: ${circuitNot.getOutput("out")}`); // Should be false

export {
  andGate,
  circuitNand,
  circuitNot,
  circuitOutput,
  inputNode,
  // Export example functions for testing
  nandGate,
  notGate,
  outputNode,
  reactiveNand,
};
