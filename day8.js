const fs = require("fs");

const lines = fs
  .readFileSync("day8.txt", "ascii")
  .split("\n")
  .filter((line) => line.length)
  .map((line) => {
    const [left, right] = line
      .split(" | ")
      .map((s) => s.split(" ").map((w) => new Set(w)));
    return {
      left: left
        .filter((s) => s.size == 2 || s.size == 4)
        .sort((s1, s2) => s1.size - s2.size),
      right,
    };
  });

lookup = {
  "002": 1,
  "003": 7,
  "004": 4,
  "006": 9,
  "007": 8,
  "015": 3,
  "016": 0,
  "105": 2,
  "115": 5,
  "116": 6,
};

function proc({ left: [d1, d4], right }) {
  return parseInt(
    right
      .map((d) =>
        [
          [...d].filter((x) => d1.has(x)).length % 2,
          [...d].filter((x) => d4.has(x)).length % 2,
          d.size,
        ].join("")
      )
      .map((x) => lookup[x])
      .join(""),
    10
  );
}

console.log(lines.map(proc).reduce((a, b) => a + b));
