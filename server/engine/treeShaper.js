/**
 * treeShaper.js
 * Builds a nested JSON tree from the adjacency list starting at a given root.
 * Also calculates depth (node count on the longest root-to-leaf path).
 */

/**
 * Builds the nested tree object iteratively.
 * Example: root "A" with A->B, A->C, B->D produces:
 *   { "A": { "B": { "D": {} }, "C": {} } }
 */
function shapeTree(root, adjacency) {
  const tree = {};
  const rootBranch = {};
  tree[root] = rootBranch;

  // BFS to build the nested structure
  // queue items: { nodeName, hostObject } where hostObject is the dict to populate
  const queue = [{ nodeName: root, hostObject: rootBranch }];

  while (queue.length > 0) {
    const { nodeName, hostObject } = queue.shift();
    const children = adjacency[nodeName] || [];

    // sort children alphabetically for consistent output
    const sorted = [...children].sort();

    for (const child of sorted) {
      const childBranch = {};
      hostObject[child] = childBranch;
      queue.push({ nodeName: child, hostObject: childBranch });
    }
  }

  return tree;
}

/**
 * Measures depth as the number of nodes on the longest root-to-leaf path.
 * Uses iterative DFS with an explicit stack to avoid recursion limits.
 */
function measureDepth(root, adjacency) {
  let maxDepth = 0;

  // stack entries: { node, currentDepth }
  const stack = [{ node: root, currentDepth: 1 }];

  while (stack.length > 0) {
    const { node, currentDepth } = stack.pop();
    const children = adjacency[node] || [];

    if (children.length === 0) {
      // leaf node
      if (currentDepth > maxDepth) maxDepth = currentDepth;
    } else {
      for (const child of children) {
        stack.push({ node: child, currentDepth: currentDepth + 1 });
      }
    }
  }

  return maxDepth;
}

/**
 * Identifies the root of a component.
 * Root = node that never appears as a child within this component.
 * If all nodes appear as children (pure cycle), use lexicographically smallest.
 */
function findComponentRoot(componentNodes, assignedParent) {
  const candidates = [];

  for (const node of componentNodes) {
    // a root is a node whose parent (if any) is NOT in this component,
    // or has no assigned parent at all
    const par = assignedParent[node];
    if (par === undefined || !componentNodes.has(par)) {
      candidates.push(node);
    }
  }

  if (candidates.length === 0) {
    // pure cycle — pick lexicographically smallest
    const sorted = [...componentNodes].sort();
    return sorted[0];
  }

  // return lexicographically smallest root candidate
  candidates.sort();
  return candidates[0];
}

module.exports = { shapeTree, measureDepth, findComponentRoot };
