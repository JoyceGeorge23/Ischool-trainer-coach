// Vercel Serverless Function entry point
// In serverless, the credential file won't exist — Drive loader already
// handles this gracefully (falls back to hardcoded KB).

// Ensure env vars are loaded
require("dotenv").config();

const app = require("../server");

module.exports = app;
