/**
 * panelManager.js
 * Manages tab switching and tree/JSON view toggle.
 */

(function () {

  function initTabs() {
    var tabContainer = document.getElementById('resultTabs');
    if (!tabContainer) return;

    tabContainer.addEventListener('click', function (e) {
      var clicked = e.target.closest('.tab');
      if (!clicked) return;

      var targetPane = clicked.getAttribute('data-tab');

      // deactivate all tabs visually
      var allTabs = tabContainer.querySelectorAll('.tab');
      for (var i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active');
      }
      clicked.classList.add('active');

      // hide all panes, show the target one
      var allPanes = document.querySelectorAll('.tab-pane');
      for (var j = 0; j < allPanes.length; j++) {
        allPanes[j].style.display = 'none';
      }
      var pane = document.querySelector('.tab-pane[data-pane="' + targetPane + '"]');
      if (pane) pane.style.display = 'block';
    });
  }

  function initViewToggle() {
    var btnTree = document.getElementById('btnTreeView');
    var btnJson = document.getElementById('btnJsonView');
    var tabBody = document.getElementById('tabBody');
    var jsonView = document.getElementById('jsonView');
    var resultTabs = document.getElementById('resultTabs');

    if (!btnTree || !btnJson) return;

    btnTree.addEventListener('click', function () {
      btnTree.classList.add('active');
      btnJson.classList.remove('active');
      tabBody.style.display = '';
      jsonView.style.display = 'none';
      resultTabs.style.display = '';
    });

    btnJson.addEventListener('click', function () {
      btnJson.classList.add('active');
      btnTree.classList.remove('active');
      jsonView.style.display = '';
      tabBody.style.display = 'none';
      resultTabs.style.display = 'none';
    });
  }

  function initCardCollapse() {
    document.addEventListener('click', function (e) {
      // hierarchy card header click -> toggle body
      var header = e.target.closest('.hierarchy-header');
      if (header) {
        var bodyId = header.getAttribute('data-target');
        var body = document.getElementById(bodyId);
        if (body) body.classList.toggle('collapsed');
        return;
      }

      // tree node label click -> toggle branch
      var label = e.target.closest('.tree-node-label');
      if (label) {
        var nid = label.getAttribute('data-nid');
        var branch = document.getElementById(nid);
        if (!branch) return;

        var arrow = label.querySelector('.node-arrow');
        if (branch.style.display === 'none') {
          branch.style.display = '';
          if (arrow) arrow.classList.add('open');
        } else {
          branch.style.display = 'none';
          if (arrow) arrow.classList.remove('open');
        }
      }
    });
  }

  function updateTabBadges(response) {
    var tabs = document.querySelectorAll('.tab');
    var counts = {
      hierarchies: 0,
      cycles: 0,
      invalid: 0,
      duplicates: 0,
      summary: null
    };

    if (response.hierarchies) {
      for (var i = 0; i < response.hierarchies.length; i++) {
        if (response.hierarchies[i].has_cycle) {
          counts.cycles++;
        } else {
          counts.hierarchies++;
        }
      }
    }
    counts.invalid = (response.invalid_entries || []).length;
    counts.duplicates = (response.duplicate_edges || []).length;

    for (var t = 0; t < tabs.length; t++) {
      var tabName = tabs[t].getAttribute('data-tab');
      var existing = tabs[t].querySelector('.badge');
      if (existing) existing.remove();

      var val = counts[tabName];
      if (val !== null && val !== undefined) {
        var badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = val;
        tabs[t].appendChild(badge);
      }
    }
  }

  window.PanelManager = {
    initTabs: initTabs,
    initViewToggle: initViewToggle,
    initCardCollapse: initCardCollapse,
    updateTabBadges: updateTabBadges
  };
})();
