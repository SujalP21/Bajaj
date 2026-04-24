const express = require('express');
const router = express.Router();

const { classifyEntries } = require('../engine/inputSanitizer');
const { forgeGraph, extractComponents } = require('../engine/graphForge');
const { probeForCycles } = require('../engine/cycleProbe');
const { shapeTree, measureDepth, findComponentRoot } = require('../engine/treeShaper');
const { compileSummary } = require('../engine/summaryCompiler');

// identity fields
const IDENTITY = {
  user_id: 'sujalpareek_19052004',
  email_id: 'sp9303@srmist.edu.in',
  college_roll_number: 'RA2311033010169'
};

router.post('/', (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: 'Request body must contain a "data" array of strings.'
      });
    }

    // Step 1 — classify inputs
    const { validPairs, rejected } = classifyEntries(data);

    // Step 2 — build graph, handle duplicates & multi-parent
    const { adjacency, assignedParent, allNodes, duplicateEdges } = forgeGraph(validPairs);

    // Step 3 — find connected components
    const components = extractComponents(adjacency, allNodes);

    // Step 4 — process each component
    const hierarchies = [];

    // sort components by their root for deterministic output
    const componentData = components.map(comp => {
      const root = findComponentRoot(comp, assignedParent);
      return { comp, root };
    });
    componentData.sort((a, b) => {
      // non-cyclic first, then by root alphabetically
      return a.root < b.root ? -1 : a.root > b.root ? 1 : 0;
    });

    for (const { comp, root } of componentData) {
      const hasCycle = probeForCycles(adjacency, comp);

      if (hasCycle) {
        hierarchies.push({
          root: root,
          tree: {},
          has_cycle: true
        });
      } else {
        const tree = shapeTree(root, adjacency);
        const depth = measureDepth(root, adjacency);

        hierarchies.push({
          root: root,
          tree: tree,
          depth: depth
        });
      }
    }

    // Step 5 — compile summary
    const summary = compileSummary(hierarchies);

    // assemble response
    const response = {
      ...IDENTITY,
      hierarchies,
      invalid_entries: rejected,
      duplicate_edges: duplicateEdges,
      summary
    };

    return res.json(response);
  } catch (err) {
    console.error('Processing error:', err);
    return res.status(500).json({ error: 'Internal processing failure.' });
  }
});

module.exports = router;
