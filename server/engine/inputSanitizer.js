/**
 * inputSanitizer.js
 * Classifies raw input strings into valid edges vs invalid entries.
 * Valid format: exactly one uppercase letter, arrow "->", one uppercase letter.
 * Self-loops (A->A) are treated as invalid.
 */

const EDGE_PATTERN = /^([A-Z])->([A-Z])$/;

function classifyEntries(rawData) {
  const validPairs = [];
  const rejected = [];

  if (!Array.isArray(rawData)) {
    return { validPairs, rejected: [] };
  }

  for (let i = 0; i < rawData.length; i++) {
    const raw = rawData[i];

    // must be a string
    if (typeof raw !== 'string') {
      rejected.push(String(raw));
      continue;
    }

    // trim leading/trailing whitespace before validation
    const trimmed = raw.trim();

    // empty after trim
    if (trimmed.length === 0) {
      rejected.push(raw);
      continue;
    }

    const match = trimmed.match(EDGE_PATTERN);

    if (!match) {
      // does not conform to X->Y single uppercase
      rejected.push(trimmed);
      continue;
    }

    const parent = match[1];
    const child = match[2];

    // self-loop check
    if (parent === child) {
      rejected.push(trimmed);
      continue;
    }

    validPairs.push({ parent, child, original: trimmed });
  }

  return { validPairs, rejected };
}

module.exports = { classifyEntries };
