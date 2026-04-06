const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/authorization");
const { verifyToken } = require("../Middleware/authentication");
const lookupController = require("../Controller/lookupController");

// GET - types list
router.get(
  "/types",
  verifyToken,
  authorize("READ_RECORD"),
  lookupController.getTypes,
);

// GET - categories list
router.get(
  "/categories",
  verifyToken,
  authorize("READ_RECORD"),
  lookupController.getCategories,
);

module.exports = router;

