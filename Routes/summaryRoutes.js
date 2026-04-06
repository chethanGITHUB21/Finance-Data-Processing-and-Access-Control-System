const router = require("express").Router();
const authorize = require("../Middleware/authorization");
const { verifyToken } = require("../Middleware/authentication");
const routeSummary = require("../Controller/summaryController");

// GET - Total overview ( analyst, admin, viewer)
router.get(
  "/overview",
  verifyToken,
  authorize("VIEW_SUMMARY"),
  routeSummary.getOverview,
);

// GET - category wise ( analyst, admin, viewer)
router.get(
  "/Category",
  verifyToken,
  authorize("VIEW_SUMMARY"),
  routeSummary.getCategory,
);

// GET - Trend wise ( analyst, admin, viewer)
router.get(
  "/trends",
  verifyToken,
  authorize("VIEW_SUMMARY"),
  routeSummary.getTrends,
);

module.exports = router;
