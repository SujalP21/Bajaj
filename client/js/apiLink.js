/**
 * apiLink.js
 * Handles communication with the /bfhl backend endpoint.
 */

(function () {
  // when served from the same Express server, use same origin
  // for separate deployment, replace with your Render URL
  const API_BASE = window.location.origin;

  async function fireRequest(dataArray) {
    const url = `${API_BASE}/bfhl`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dataArray })
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      throw new Error(errBody.error || `Server responded with status ${resp.status}`);
    }
    return resp.json();
  }

  window.ApiLink = { fireRequest };
})();
