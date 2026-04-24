/**
 * main.js
 * App orchestrator — wires up UI events and renders API results.
 */

(function () {
  var edgeInput = document.getElementById('edgeInput');
  var btnSubmit = document.getElementById('btnSubmit');
  var btnClear = document.getElementById('btnClear');
  var errorBox = document.getElementById('errorBox');
  var resultsPanel = document.getElementById('resultsPanel');
  var stepsPanel = document.getElementById('stepsPanel');
  var stepsList = document.getElementById('stepsList');
  var jsonOutput = document.getElementById('jsonOutput');
  var tabBody = document.getElementById('tabBody');
  var jsonView = document.getElementById('jsonView');
  var btnTreeView = document.getElementById('btnTreeView');
  var btnJsonView = document.getElementById('btnJsonView');

  // pane containers
  var paneHierarchies = document.getElementById('paneHierarchies');
  var paneCycles = document.getElementById('paneCycles');
  var paneInvalid = document.getElementById('paneInvalid');
  var paneDuplicates = document.getElementById('paneDuplicates');
  var paneSummary = document.getElementById('paneSummary');

  // last response
  var lastResponse = null;

  // init interactions
  PanelManager.initTabs();
  PanelManager.initViewToggle();
  PanelManager.initCardCollapse();

  btnSubmit.addEventListener('click', handleSubmit);
  btnClear.addEventListener('click', handleClear);

  // Ctrl+Enter shortcut
  edgeInput.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'Enter') handleSubmit();
  });

  function handleClear() {
    edgeInput.value = '';
    errorBox.classList.add('hidden');
    resultsPanel.style.display = 'none';
    stepsPanel.classList.add('hidden');
    lastResponse = null;
  }

  async function handleSubmit() {
    errorBox.classList.add('hidden');
    resultsPanel.style.display = 'none';

    var raw = edgeInput.value.trim();
    if (!raw) {
      showError('Please enter a JSON array of edge strings.');
      return;
    }

    // parse input — accept JSON array or line-separated entries
    var dataArray;
    try {
      dataArray = JSON.parse(raw);
    } catch (_) {
      dataArray = raw.split('\n')
        .map(function (s) { return s.trim().replace(/^["',]+|["',]+$/g, ''); })
        .filter(function (s) { return s.length > 0; });
    }

    if (!Array.isArray(dataArray)) {
      showError('Input must be a JSON array, e.g. ["A->B", "A->C"]');
      return;
    }

    showSteps(dataArray);

    btnSubmit.classList.add('loading');
    btnSubmit.disabled = true;

    try {
      var response = await ApiLink.fireRequest(dataArray);
      lastResponse = response;
      renderResults(response);
    } catch (err) {
      showError('API Error: ' + err.message);
    } finally {
      btnSubmit.classList.remove('loading');
      btnSubmit.disabled = false;
    }
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }

  function showSteps(dataArray) {
    stepsList.innerHTML = '';
    stepsPanel.classList.remove('hidden');

    addStep('Received ' + dataArray.length + ' input entries', 'ok');
    var validCount = 0;
    var invalidCount = 0;
    for (var i = 0; i < dataArray.length; i++) {
      var s = typeof dataArray[i] === 'string' ? dataArray[i].trim() : '';
      if (/^[A-Z]->[A-Z]$/.test(s) && s[0] !== s[3]) {
        validCount++;
      } else {
        invalidCount++;
      }
    }
    addStep(validCount + ' entries match valid edge format', 'ok');
    if (invalidCount > 0) {
      addStep(invalidCount + ' entries flagged as invalid', 'warn');
    }
    addStep('Sending to /bfhl for processing...', 'ok');
  }

  function addStep(text, type) {
    var li = document.createElement('li');
    li.className = type === 'warn' ? 'step-warn' : 'step-ok';
    li.textContent = text;
    stepsList.appendChild(li);
  }

  function renderResults(resp) {
    // force tree view mode on fresh render
    btnTreeView.classList.add('active');
    btnJsonView.classList.remove('active');
    tabBody.style.display = '';
    jsonView.style.display = 'none';

    // populate JSON view for later toggle
    jsonOutput.textContent = JSON.stringify(resp, null, 2);

    // update tab badges
    PanelManager.updateTabBadges(resp);

    // reset to first tab
    var allTabs = document.querySelectorAll('.tab');
    for (var ti = 0; ti < allTabs.length; ti++) {
      allTabs[ti].classList.remove('active');
    }
    allTabs[0].classList.add('active');

    var allPanes = document.querySelectorAll('.tab-pane');
    for (var pi = 0; pi < allPanes.length; pi++) {
      allPanes[pi].style.display = 'none';
    }
    paneHierarchies.style.display = 'block';

    // separate trees and cycles
    var trees = [];
    var cycles = [];
    var hierarchies = resp.hierarchies || [];
    for (var i = 0; i < hierarchies.length; i++) {
      if (hierarchies[i].has_cycle) {
        cycles.push(hierarchies[i]);
      } else {
        trees.push(hierarchies[i]);
      }
    }

    // render hierarchies (non-cyclic trees only)
    if (trees.length === 0) {
      paneHierarchies.innerHTML = emptyState('📭', 'No valid trees found.');
    } else {
      var treeHtml = '';
      for (var t = 0; t < trees.length; t++) {
        treeHtml += TreeRenderer.buildHierarchyCard(trees[t], t);
      }
      paneHierarchies.innerHTML = treeHtml;
    }

    // render cycles
    if (cycles.length === 0) {
      paneCycles.innerHTML = emptyState('✅', 'No cycles detected.');
    } else {
      var cycleHtml = '';
      for (var c = 0; c < cycles.length; c++) {
        cycleHtml += TreeRenderer.buildHierarchyCard(cycles[c], 'c' + c);
      }
      paneCycles.innerHTML = cycleHtml;
    }

    // render invalid entries
    var invalids = resp.invalid_entries || [];
    if (invalids.length === 0) {
      paneInvalid.innerHTML = emptyState('✅', 'All entries are valid.');
    } else {
      var invHtml = '<ul class="entry-list">';
      for (var v = 0; v < invalids.length; v++) {
        invHtml += '<li class="entry-item is-invalid">';
        invHtml += '<span class="entry-icon">✗</span>';
        invHtml += escapeHtml(invalids[v]);
        invHtml += '</li>';
      }
      invHtml += '</ul>';
      paneInvalid.innerHTML = invHtml;
    }

    // render duplicate edges
    var dups = resp.duplicate_edges || [];
    if (dups.length === 0) {
      paneDuplicates.innerHTML = emptyState('✅', 'No duplicate edges.');
    } else {
      var dupHtml = '<ul class="entry-list">';
      for (var d = 0; d < dups.length; d++) {
        dupHtml += '<li class="entry-item is-dup">';
        dupHtml += '<span class="entry-icon">⊘</span>';
        dupHtml += escapeHtml(dups[d]);
        dupHtml += '</li>';
      }
      dupHtml += '</ul>';
      paneDuplicates.innerHTML = dupHtml;
    }

    // render summary
    var sum = resp.summary || {};
    paneSummary.innerHTML = '<div class="summary-grid">'
      + statCard(sum.total_trees, 'Trees')
      + statCard(sum.total_cycles, 'Cycles')
      + statCard(sum.largest_tree_root || '—', 'Largest Root')
      + '</div>';

    // now show the results panel
    resultsPanel.style.display = '';

    addStep('Response received — ' + hierarchies.length + ' groups processed.', 'ok');
  }

  function statCard(value, label) {
    return '<div class="summary-stat">'
      + '<span class="stat-value">' + value + '</span>'
      + '<span class="stat-label">' + label + '</span>'
      + '</div>';
  }

  function emptyState(icon, text) {
    return '<div class="empty-state">'
      + '<span class="empty-icon">' + icon + '</span>'
      + text + '</div>';
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }
})();
