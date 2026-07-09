const assert = require("node:assert");
const { test } = require("node:test");
const { add, percentage } = require("../src/calculator.js");

test("add sums two numbers", () => {
  assert.strictEqual(add(2, 3), 5);
});

test("percentage computes the correct percentage", () => {
  assert.strictEqual(percentage(50, 200), 25);
});
