require("dotenv").config();
const app = require("../server");

// Export the Express app directly for Vercel (@vercel/node builder)
// Vercel passes (req, res) directly, so serverless-http causes a 500 error here.
module.exports = app;
