const express = require('express');
const path = require('path');
const cors = require('cors');
const bfhlRoute = require('./routes/bfhl');

const app = express();
const PORT = process.env.PORT || 3000;

// allow any origin — evaluator calls from different domain
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json({ limit: '1mb' }));

// main endpoint (before static files so /bfhl is always reachable)
app.use('/bfhl', bfhlRoute);

// serve frontend from the client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

app.listen(PORT, () => {
  console.log(`bfhl-engine listening on port ${PORT}`);
});
