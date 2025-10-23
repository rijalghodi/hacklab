import { CircuitSystem } from "@/lib/circuit-tree/circuit-system";
import { andChip, nandChip, notChip } from "@/lib/constants/chips";

console.log("=== Testing CircuitTree Class ===");

// Test 1: NAND Gate
console.log("\n1. Testing NAND Gate:");
const nandCircuitTree = new CircuitSystem(nandChip);

const nandTests = [
  { input: { a: false, b: false }, expected: true },
  { input: { a: false, b: true }, expected: true },
  { input: { a: true, b: false }, expected: true },
  { input: { a: true, b: true }, expected: false },
];

nandTests.forEach((test, index) => {
  const result = nandCircuitTree.calculateTree(test.input);
  const actual = result.out;
  const passed = actual === test.expected;

  console.log(
    `  Test ${index + 1}: ${JSON.stringify(
      test.input,
    )} -> ${actual} (expected: ${test.expected}) ${passed ? "✅" : "❌"}`,
  );
});

// Test 2: NOT Gate (using NAND)
console.log("\n2. Testing NOT Gate:");
const notCircuitTree = new CircuitSystem(notChip);

const notTests = [
  { input: { ysv3o6cg: false }, expected: true },
  { input: { ysv3o6cg: true }, expected: false },
];

notTests.forEach((test, index) => {
  const result = notCircuitTree.calculateTree(test.input);
  const actual = result["9861akqh"];
  const passed = actual === test.expected;

  console.log(
    `  Test ${index + 1}: ${JSON.stringify(
      test.input,
    )} -> ${actual} (expected: ${test.expected}) ${passed ? "✅" : "❌"}`,
  );
});

// Test 3: AND Gate
console.log("\n3. Testing AND Gate:");
const andCircuitTree = new CircuitSystem(andChip);

const andTests = [
  { input: { xqz6exxl: false, "23xwycvx": false }, expected: false },
  { input: { xqz6exxl: false, "23xwycvx": true }, expected: false },
  { input: { xqz6exxl: true, "23xwycvx": false }, expected: false },
  { input: { xqz6exxl: true, "23xwycvx": true }, expected: true },
];

andTests.forEach((test, index) => {
  const result = andCircuitTree.calculateTree(test.input);
  const actual = result["eoqc0cw1"];
  const passed = actual === test.expected;

  console.log(
    `  Test ${index + 1}: ${JSON.stringify(
      test.input,
    )} -> ${actual} (expected: ${test.expected}) ${passed ? "✅" : "❌"}`,
  );
});

// Test 4: Cache functionality
console.log("\n4. Testing Cache Functionality:");
const testInput = { a: true, b: false };

// First call (should calculate)
console.log("  First call (should calculate):");
const result1 = nandCircuitTree.calculateTree(testInput);
console.log(`  Result: ${result1.out}`);

// Second call (should use cache)
console.log("  Second call (should use cache):");
const result2 = nandCircuitTree.calculateTree(testInput);
console.log(`  Result: ${result2.out}`);

// Test 5: Error handling
console.log("\n5. Testing Error Handling:");
try {
  nandCircuitTree.calculateTree({ a: true }); // Missing input
  console.log("  ❌ Should have thrown error for missing input");
} catch (error) {
  console.log("  ✅ Correctly threw error for missing input:", (error as Error).message);
}

try {
  nandCircuitTree.calculateTree({ a: true, b: false, c: true }); // Extra input
  console.log("  ❌ Should have thrown error for extra input");
} catch (error) {
  console.log("  ✅ Correctly threw error for extra input:", (error as Error).message);
}

console.log("\n=== All Tests Completed ===");
