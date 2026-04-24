# BFHL Hierarchy Processor

Full-stack application for the SRM Full Stack Engineering Challenge - Bajaj Finserv Health Limited (BFHL).

## What it does

Accepts an array of directed edge strings (e.g. `"A->B"`), validates them, builds tree hierarchies, detects cycles, and returns structured insights via a REST API. The frontend visualizes results with interactive tree views.

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML / CSS / JavaScript (no frameworks, no templates)

## Project Structure

```
├── server/
│   ├── app.js                  # Express entry point
│   ├── routes/bfhl.js          # POST /bfhl handler
│   ├── engine/
│   │   ├── inputSanitizer.js   # Validate & classify input
│   │   ├── graphForge.js       # Build graph, handle duplicates
│   │   ├── cycleProbe.js       # Iterative cycle detection
│   │   ├── treeShaper.js       # Nested tree builder + depth
│   │   └── summaryCompiler.js  # Aggregate summary stats
│   └── render.yaml             # Render deploy config
├── client/
│   ├── index.html
│   ├── css/forge.css           # Handwritten stylesheet
│   ├── js/
│   │   ├── main.js             # App orchestrator
│   │   ├── apiLink.js          # API communication
│   │   ├── treeRenderer.js     # Tree visualization
│   │   └── panelManager.js     # UI tab/toggle management
│   └── vercel.json             # Vercel deploy config
```

## Running Locally

```bash
# Backend
cd server
npm install
node app.js
# → http://localhost:3000

# Frontend
# Open client/index.html in a browser, or use a local server:
cd client
npx serve .
```

## API Usage

```
POST /bfhl
Content-Type: application/json

{
  "data": ["A->B", "A->C", "B->D", "X->Y", "Y->Z", "Z->X"]
}
```

## Deployment

- **Backend** → Render (Web Service, Node runtime)
- **Frontend** → Vercel (static site)

After deploying the backend to Render, update `API_BASE` in `client/js/apiLink.js` with your Render URL.

## Test Cases

**Basic tree:**
```json
{"data": ["A->B", "B->C"]}
```

**Cycle detection:**
```json
{"data": ["X->Y", "Y->Z", "Z->X"]}
```

**Mixed input:**
```json
{"data": ["A->B", "A->C", "B->D", "C->E", "E->F", "X->Y", "Y->Z", "Z->X", "P->Q", "Q->R", "G->H", "G->H", "G->I", "hello", "1->2", "A->"]}
```
