/**
 * summaryCompiler.js
 * Aggregates hierarchy results into a summary object.
 */

function compileSummary(hierarchies) {
  let treeCount = 0;
  let cycleCount = 0;
  let deepestRoot = '';
  let deepestValue = 0;

  for (const entry of hierarchies) {
    if (entry.has_cycle) {
      cycleCount++;
    } else {
      treeCount++;
      const d = entry.depth || 0;

      if (d > deepestValue) {
        deepestValue = d;
        deepestRoot = entry.root;
      } else if (d === deepestValue && entry.root < deepestRoot) {
        // lexicographic tiebreaker
        deepestRoot = entry.root;
      }
    }
  }

  return {
    total_trees: treeCount,
    total_cycles: cycleCount,
    largest_tree_root: deepestRoot
  };
}

module.exports = { compileSummary };
