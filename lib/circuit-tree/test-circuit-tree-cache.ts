import { CircuitSystem } from "@/lib/circuit-tree/circuit-system";
import { andChip } from "@/lib/constants/chips";

console.log("=== Testing AND Gate Cache Performance ===");

// Test 1: Basic cache functionality with timing
console.log("\n1. Basic AND Gate Cache Test:");
const andCircuitTree = new CircuitSystem(andChip);
const testInput = { xqz6exxl: true, "23xwycvx": false };

// First call (should calculate)
console.log("  First call (calculating):");
const start1 = performance.now();
const result1 = andCircuitTree.calculateTree(testInput);
const end1 = performance.now();
const time1 = end1 - start1;
console.log(`  Result: ${result1["eoqc0cw1"]} (Time: ${time1.toFixed(4)}ms)`);

// Second call (should use cache)
console.log("  Second call (using cache):");
const start2 = performance.now();
const result2 = andCircuitTree.calculateTree(testInput);
const end2 = performance.now();
const time2 = end2 - start2;
console.log(`  Result: ${result2["eoqc0cw1"]} (Time: ${time2.toFixed(4)}ms)`);

// Performance comparison
const speedup = time1 / time2;
console.log(`  Speedup: ${speedup.toFixed(2)}x faster with cache`);

// Test 2: Multiple iterations for reliable timing
console.log("\n2. Multiple Iterations Test:");
const iterations = 1000;
console.log(`  Running ${iterations} iterations for reliable timing...`);

// First pass - all calculations (no cache hits)
console.log("  First pass (calculating, no cache):");
const start3 = performance.now();
for (let i = 0; i < iterations; i++) {
  andCircuitTree.calculateTree(testInput);
}
const end3 = performance.now();
const time3 = end3 - start3;
console.log(`  Total time: ${time3.toFixed(4)}ms (avg: ${(time3 / iterations).toFixed(6)}ms per call)`);

// Second pass - all cache hits
console.log("  Second pass (using cache):");
const start4 = performance.now();
for (let i = 0; i < iterations; i++) {
  andCircuitTree.calculateTree(testInput);
}
const end4 = performance.now();
const time4 = end4 - start4;
console.log(`  Total time: ${time4.toFixed(4)}ms (avg: ${(time4 / iterations).toFixed(6)}ms per call)`);

// Performance comparison
const speedup2 = time3 / time4;
console.log(`  Speedup: ${speedup2.toFixed(2)}x faster with cache`);

// Test 3: All AND gate input combinations
console.log("\n3. All AND Gate Input Combinations:");
const andTestInputs = [
  { xqz6exxl: false, "23xwycvx": false },
  { xqz6exxl: false, "23xwycvx": true },
  { xqz6exxl: true, "23xwycvx": false },
  { xqz6exxl: true, "23xwycvx": true },
];

let totalTimeFirstPass = 0;
let totalTimeSecondPass = 0;

console.log("  First pass (calculating all inputs):");
for (const input of andTestInputs) {
  const start = performance.now();
  andCircuitTree.calculateTree(input);
  const end = performance.now();
  const time = end - start;
  totalTimeFirstPass += time;
  console.log(`    ${JSON.stringify(input)}: ${time.toFixed(4)}ms`);
}

console.log("  Second pass (using cache for all inputs):");
for (const input of andTestInputs) {
  const start = performance.now();
  andCircuitTree.calculateTree(input);
  const end = performance.now();
  const time = end - start;
  totalTimeSecondPass += time;
  console.log(`    ${JSON.stringify(input)}: ${time.toFixed(4)}ms`);
}

console.log(`  Total first pass time: ${totalTimeFirstPass.toFixed(4)}ms`);
console.log(`  Total second pass time: ${totalTimeSecondPass.toFixed(4)}ms`);
console.log(`  Overall speedup: ${(totalTimeFirstPass / totalTimeSecondPass).toFixed(2)}x faster with cache`);

// Test 4: Cache memory usage
console.log("\n4. Cache Memory Usage:");
console.log(`  Cache size: ${andCircuitTree.getCacheSize()} entries`);
console.log(`  Cache entries:`);
for (const [key, value] of andCircuitTree.getCacheEntries()) {
  console.log(`    ${key} -> ${JSON.stringify(value)}`);
}

console.log("\n=== AND Gate Cache Performance Test Completed ===");
