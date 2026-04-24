/**
 * cycleProbe.js
 * Detects whether a directed graph component contains any cycle.
 * Uses iterative DFS with three-state coloring:
 *   UNVISITED (0) → EXPLORING (1) → RESOLVED (2)
 * A back-edge to an EXPLORING node means a cycle exists.
 */

const UNVISITED = 0;
const EXPLORING = 1;
const RESOLVED = 2;

function probeForCycles(adjacency, componentNodes) {
  const paintState = {};

  for (const node of componentNodes) {
    paintState[node] = UNVISITED;
  }

  for (const startNode of componentNodes) {
    if (paintState[startNode] !== UNVISITED) continue;

    // iterative DFS using explicit stack
    // each stack entry: { node, childIndex }
    const stack = [{ node: startNode, childIdx: 0 }];
    paintState[startNode] = EXPLORING;

    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      const children = adjacency[top.node] || [];

      if (top.childIdx >= children.length) {
        // all children processed — mark resolved
        paintState[top.node] = RESOLVED;
        stack.pop();
        continue;
      }

      const nextChild = children[top.childIdx];
      top.childIdx++;

      if (!componentNodes.has(nextChild)) continue;

      if (paintState[nextChild] === EXPLORING) {
        // back-edge found — cycle confirmed
        return true;
      }

      if (paintState[nextChild] === UNVISITED) {
        paintState[nextChild] = EXPLORING;
        stack.push({ node: nextChild, childIdx: 0 });
      }
    }
  }

  return false;
}

module.exports = { probeForCycles };
