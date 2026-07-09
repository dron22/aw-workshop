function add(a, b) {
  return a + b;
}

function percentage(part, total) {
  // BUG: should be (part / total) * 100
  return (part / total) * 10;
}

module.exports = { add, percentage };
