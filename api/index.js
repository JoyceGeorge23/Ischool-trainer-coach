require("dotenv").config();
const serverless = require("serverless-http");
const app = require("../server");

// Wrap the Express app for Serverless environments (Vercel/Netlify)
// This prevents FUNCTION_INVOCATION_FAILED and body-parser hangs.
module.exports = serverless(app);
