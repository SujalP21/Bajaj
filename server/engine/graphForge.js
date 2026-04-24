/**
 * graphForge.js
 * Builds adjacency structures from validated edge pairs.
 * Handles duplicate detection and multi-parent conflict resolution.
 *
 * Rules:
 *  - First occurrence of an edge wins; repeats go to duplicateEdges (once each).
 *  - If a child already has a parent, the later edge is silently dropped (multi-parent).
 */

function forgeGraph(validPairs) {
  const seenEdges = new Set();          // "X->Y" strings already accepted
  const reportedDuplicates = new Set(); // only report each dup once
  const duplicateEdges = [];

  const adjacency = {};   // parent -> [children]
  const assignedParent = {}; // child -> first parent
  const allNodes = new Set();

  for (let i = 0; i < validPairs.length; i++) {
    const { parent, child, original } = validPairs[i];
    const edgeKey = `${parent}->${child}`;

    // duplicate check
    if (seenEdges.has(edgeKey)) {
      if (!reportedDuplicates.has(edgeKey)) {
        duplicateEdges.push(edgeKey);
        reportedDuplicates.add(edgeKey);
      }
      continue;
    }
    seenEdges.add(edgeKey);

    // multi-parent: if child already has a parent, drop silently
    if (assignedParent[child] !== undefined) {
      continue;
    }

    // record the edge
    assignedParent[child] = parent;
    if (!adjacency[parent]) adjacency[parent] = [];
    adjacency[parent].push(child);

    allNodes.add(parent);
    allNodes.add(child);
  }

  // ensure leaf nodes appear in adjacency even with no children
  for (const node of allNodes) {
    if (!adjacency[node]) adjacency[node] = [];
  }

  return { adjacency, assignedParent, allNodes, duplicateEdges };
}

/**
 * Splits all nodes into connected components using BFS flood-fill.
 * Returns array of Sets, each containing the nodes of one component.
 */
function extractComponents(adjacency, allNodes) {
  const visited = new Set();
  const components = [];

  // build undirected neighbor map for component discovery
  const neighbors = {};
  for (const node of allNodes) {
    neighbors[node] = new Set();
  }
  for (const parent of Object.keys(adjacency)) {
    for (const child of adjacency[parent]) {
      neighbors[parent].add(child);
      neighbors[child].add(parent);
    }
  }

  for (const startNode of allNodes) {
    if (visited.has(startNode)) continue;

    const component = new Set();
    const queue = [startNode];
    visited.add(startNode);

    while (queue.length > 0) {
      const current = queue.shift();
      component.add(current);

      for (const neighbor of neighbors[current]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  return components;
}

module.exports = { forgeGraph, extractComponents };
