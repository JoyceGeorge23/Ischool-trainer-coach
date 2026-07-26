let app;
try {
  require("dotenv").config();
  app = require("../server");
} catch (error) {
  app = (req, res) => {
    res.status(500).json({
      error: "Initialization failed",
      message: error.message,
      stack: error.stack,
    });
  };
}
module.exports = app;
