# BFHL Hierarchy Processor

Full-stack application for the BFHL - SRM Full Stack Engineering Challenge. Accepts directed edge strings, validates them, builds tree hierarchies, detects cycles, and returns structured insights via a REST API with an interactive frontend.

## Live URLs

- **Frontend**: https://bajaj-bfhl-engine.onrender.com
- **API Base**: https://bajaj-bfhl-engine.onrender.com
- **API Endpoint**: `POST https://bajaj-bfhl-engine.onrender.com/bfhl`

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML / CSS / JavaScript (no frameworks, no templates)
- **Hosting**: Render (single service for both API and frontend)

## Project Structure

```
├── server/
│   ├── app.js                  # Express entry point + static serving
│   ├── routes/bfhl.js          # POST /bfhl handler
│   ├── engine/
│   │   ├── inputSanitizer.js   # Validate & classify input strings
│   │   ├── graphForge.js       # Build graph, deduplicate, handle multi-parent
│   │   ├── cycleProbe.js       # Iterative cycle detection (3-state coloring)
│   │   ├── treeShaper.js       # Nested tree builder + depth calculation
│   │   └── summaryCompiler.js  # Aggregate summary statistics
│   └── render.yaml             # Render deploy config
├── client/
│   ├── index.html
│   ├── css/forge.css           # Handwritten dark industrial theme
│   ├── js/
│   │   ├── main.js             # App orchestrator
│   │   ├── apiLink.js          # API communication layer
│   │   ├── treeRenderer.js     # Interactive tree visualization
│   │   └── panelManager.js     # Tab/toggle/collapse management
│   └── vercel.json
├── package.json
├── .gitignore
└── README.md
```

## Running Locally

```bash
# Install dependencies
cd server
npm install

# Start server (serves both API and frontend)
cd ..
node server/app.js
# → http://localhost:3000
```

## API Usage

```
POST /bfhl
Content-Type: application/json
```

### Request

```json
{
  "data": ["A->B", "A->C", "B->D", "C->E", "E->F", "X->Y", "Y->Z", "Z->X", "P->Q", "Q->R", "G->H", "G->H", "G->I", "hello", "1->2", "A->"]
}
```

### Response

```json
{
  "user_id": "sujalpareek_19052004",
  "email_id": "sp9303@srmist.edu.in",
  "college_roll_number": "RA2311033010169",
  "hierarchies": [
    { "root": "A", "tree": { "A": { "B": { "D": {} }, "C": { "E": { "F": {} } } } }, "depth": 4 },
    { "root": "G", "tree": { "G": { "H": {}, "I": {} } }, "depth": 2 },
    { "root": "P", "tree": { "P": { "Q": { "R": {} } } }, "depth": 3 },
    { "root": "X", "tree": {}, "has_cycle": true }
  ],
  "invalid_entries": ["hello", "1->2", "A->"],
  "duplicate_edges": ["G->H"],
  "summary": { "total_trees": 3, "total_cycles": 1, "largest_tree_root": "A" }
}
```

## Features

- **Input Validation**: Trims whitespace, validates `X->Y` format (single uppercase letters), rejects self-loops
- **Duplicate Detection**: First occurrence wins, subsequent duplicates reported once
- **Multi-parent Handling**: First parent edge wins, later parent edges silently discarded
- **Cycle Detection**: Iterative 3-state coloring algorithm (no recursive DFS)
- **Tree Visualization**: Interactive expandable tree cards with depth indicators
- **Tabbed Results**: Separate views for Hierarchies, Cycles, Invalid entries, Duplicates, and Summary
- **View Toggle**: Switch between structured Tree view and raw JSON output
- **CORS Enabled**: API accessible from any origin

## Author

**Sujal Pareek**
- Roll Number: RA2311033010169
- Email: sp9303@srmist.edu.in
