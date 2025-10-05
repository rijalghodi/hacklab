import { builtInChips } from "./constants/chips";
import { NAND_SOURCES, NOT_SOURCES } from "./constants/circuits";
import { buildCircuitSources,computeOutputChip } from "./flow-helper";
import { CircuitSource, NodeType } from "./types/flow";

/**
 * Unit test file to compare function results with expected results from circuits.ts
 * Tests both circuit building and computation functions
 */

// Test result tracking
let testsPassed = 0;
let testsFailed = 0;

/**
 * Helper function to run a test and track results
 */
function runTest(testName: string, testFn: () => boolean): void {
  console.log(`\n🧪 Running test: ${testName}`);
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ PASSED: ${testName}`);
      testsPassed++;
    } else {
      console.log(`❌ FAILED: ${testName}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`💥 ERROR in ${testName}:`, error);
    testsFailed++;
  }
}

/**
 * Helper function to compare circuit sources
 */
function compareCircuitSources(actual: CircuitSource[], expected: CircuitSource[]): boolean {
  if (actual.length !== expected.length) {
    console.log(`❌ Length mismatch: actual=${actual.length}, expected=${expected.length}`);
    return false;
  }

  for (let i = 0; i < actual.length; i++) {
    const actualSource = actual[i];
    const expectedSource = expected[i];

    if (actualSource.portName !== expectedSource.portName) {
      console.log(`❌ Port name mismatch: actual="${actualSource.portName}", expected="${expectedSource.portName}"`);
      return false;
    }

    if (actualSource.nodes.length !== expectedSource.nodes.length) {
      console.log(
        `❌ Node count mismatch for port "${actualSource.portName}": actual=${actualSource.nodes.length}, expected=${expectedSource.nodes.length}`,
      );
      return false;
    }
  }

  return true;
}

/**
 * Helper function to compare computation results
 */
function compareResults(actual: any, expected: any): boolean {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);

  if (actualStr !== expectedStr) {
    console.log(`❌ Result mismatch:`);
    console.log(`   Actual:   ${actualStr}`);
    console.log(`   Expected: ${expectedStr}`);
    return false;
  }

  return true;
}

console.log("🚀 Starting Unit Test Suite...\n");

// ===== CIRCUIT BUILDING TESTS =====

runTest("NAND Circuit Building", () => {
  const chip = { name: "NAND", type: NodeType.CHIP };
  const actualSources = buildCircuitSources(chip, builtInChips);
  console.log("Actual NAND sources:", JSON.stringify(actualSources, null, 2));
  console.log("Expected NAND sources:", JSON.stringify(NAND_SOURCES, null, 2));
  return compareCircuitSources(actualSources, NAND_SOURCES);
});

runTest("NOT Circuit Building", () => {
  const chip = { name: "NOT", type: NodeType.CHIP };
  const actualSources = buildCircuitSources(chip, builtInChips);
  console.log("Actual NOT sources:", JSON.stringify(actualSources, null, 2));
  console.log("Expected NOT sources:", JSON.stringify(NOT_SOURCES, null, 2));
  return compareCircuitSources(actualSources, NOT_SOURCES);
});

// ===== COMPUTATION TESTS =====

runTest("NAND Gate - True and False", () => {
  const inputs = { a: true, b: false };
  const result = computeOutputChip("NAND", inputs, builtInChips);
  const expected = { out: true }; // !(true && false) = !false = true
  console.log(`NAND(${inputs.a}, ${inputs.b}) = ${result.out}, expected: ${expected.out}`);
  return compareResults(result, expected);
});

runTest("NAND Gate - True and True", () => {
  const inputs = { a: true, b: true };
  const result = computeOutputChip("NAND", inputs, builtInChips);
  const expected = { out: false }; // !(true && true) = !true = false
  console.log(`NAND(${inputs.a}, ${inputs.b}) = ${result.out}, expected: ${expected.out}`);
  return compareResults(result, expected);
});

runTest("NAND Gate - False and False", () => {
  const inputs = { a: false, b: false };
  const result = computeOutputChip("NAND", inputs, builtInChips);
  const expected = { out: true }; // !(false && false) = !false = true
  console.log(`NAND(${inputs.a}, ${inputs.b}) = ${result.out}, expected: ${expected.out}`);
  return compareResults(result, expected);
});

runTest("NAND Gate - False and True", () => {
  const inputs = { a: false, b: true };
  const result = computeOutputChip("NAND", inputs, builtInChips);
  const expected = { out: true }; // !(false && true) = !false = true
  console.log(`NAND(${inputs.a}, ${inputs.b}) = ${result.out}, expected: ${expected.out}`);
  return compareResults(result, expected);
});

runTest("NOT Gate - True Input", () => {
  const inputs = { in: true };
  const result = computeOutputChip("NOT", inputs, builtInChips);
  const expected = { out: false }; // NOT(true) = false
  console.log(`NOT(${inputs.in}) = ${result.out}, expected: ${expected.out}`);
  return compareResults(result, expected);
});

runTest("NOT Gate - False Input", () => {
  const inputs = { in: false };
  const result = computeOutputChip("NOT", inputs, builtInChips);
  const expected = { out: true }; // NOT(false) = true
  console.log(`NOT(${inputs.in}) = ${result.out}, expected: ${expected.out}`);
  return compareResults(result, expected);
});

// ===== EDGE CASE TESTS =====

runTest("NAND Gate - Mixed Boolean Inputs", () => {
  const inputs = { a: true, b: false };
  const result = computeOutputChip("NAND", inputs, builtInChips);
  const expected = { out: true }; // !(true && false) = !false = true
  console.log(`NAND(${inputs.a}, ${inputs.b}) = ${result.out}, expected: ${expected.out}`);
  return compareResults(result, expected);
});

runTest("NOT Gate - Edge Case Input", () => {
  const inputs = { in: false };
  const result = computeOutputChip("NOT", inputs, builtInChips);
  const expected = { out: true }; // NOT(false) = true
  console.log(`NOT(${inputs.in}) = ${result.out}, expected: ${expected.out}`);
  return compareResults(result, expected);
});

// ===== TEST SUMMARY =====

console.log("\n" + "=".repeat(50));
console.log("📊 TEST SUMMARY");
console.log("=".repeat(50));
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Total Tests: ${testsPassed + testsFailed}`);
console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

if (testsFailed === 0) {
  console.log("\n🎉 All tests passed! The circuit functions are working correctly.");
} else {
  console.log(`\n⚠️  ${testsFailed} test(s) failed. Please review the implementation.`);
}

console.log("\n🏁 Unit test suite complete!");
