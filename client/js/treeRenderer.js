/**
 * treeRenderer.js
 * Renders nested tree objects as interactive, expandable HTML.
 */

(function () {

  /**
   * Takes a nested tree object like { "A": { "B": { "D": {} }, "C": {} } }
   * and returns an HTML string with expandable branches.
   */
  function renderTree(treeObj, level) {
    level = level || 0;
    const keys = Object.keys(treeObj);
    if (keys.length === 0) return '';

    let html = '';
    for (let i = 0; i < keys.length; i++) {
      const nodeName = keys[i];
      const children = treeObj[nodeName];
      const childKeys = Object.keys(children);
      const hasKids = childKeys.length > 0;
      const nodeId = 'tn_' + level + '_' + nodeName + '_' + Math.random().toString(36).substr(2, 4);

      html += '<div class="tree-node">';
      html += '<span class="tree-node-label" data-nid="' + nodeId + '">';

      if (hasKids) {
        html += '<span class="node-arrow open">▶</span>';
      } else {
        html += '<span class="node-arrow" style="visibility:hidden">▶</span>';
      }

      html += '<span class="node-char">' + nodeName + '</span>';

      if (level === 0) {
        html += '<span class="depth-badge">root</span>';
      }
      html += '</span>';

      if (hasKids) {
        html += '<div class="tree-branch" id="' + nodeId + '">';
        html += renderTree(children, level + 1);
        html += '</div>';
      }

      html += '</div>';
    }
    return html;
  }

  /**
   * Renders a cycle placeholder card.
   */
  function renderCycleNotice(root) {
    return '<div class="empty-state">'
      + '<span class="empty-icon">🔄</span>'
      + 'Cycle detected — tree cannot be constructed.<br>'
      + 'All nodes in this group form a circular dependency.'
      + '</div>';
  }

  /**
   * Builds a hierarchy card (header + body with tree or cycle notice).
   */
  function buildHierarchyCard(entry, index) {
    var isCyclic = entry.has_cycle === true;
    var depthText = isCyclic ? 'cycle' : 'depth ' + entry.depth;
    var chipClass = isCyclic ? 'meta-chip cycle' : 'meta-chip';
    var cardId = 'hcard_' + index;

    var html = '<div class="hierarchy-card" id="' + cardId + '">';
    html += '<div class="hierarchy-header" data-target="' + cardId + '_body">';
    html += '<span class="hierarchy-root-label">Root: ' + entry.root + '</span>';
    html += '<div class="hierarchy-meta">';
    html += '<span class="' + chipClass + '">' + depthText + '</span>';
    html += '</div></div>';
    html += '<div class="hierarchy-body" id="' + cardId + '_body">';

    if (isCyclic) {
      html += renderCycleNotice(entry.root);
    } else {
      html += renderTree(entry.tree, 0);
    }

    html += '</div></div>';
    return html;
  }

  // expose globally
  window.TreeRenderer = {
    renderTree: renderTree,
    renderCycleNotice: renderCycleNotice,
    buildHierarchyCard: buildHierarchyCard
  };
})();
