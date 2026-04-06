const { successResponse, errorResponse } = require("../util/apiResponse");
const summaryService = require("../Service/summaryService");

// GET - Overview wise summary (analyst, admin, user)
exports.getOverview = async (req, res) => {
  try {
    const summary = await summaryService.getOverview();
    successResponse(res, 200, "Overview summary retrieved successfully", {
      summary,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(
      res,
      500,
      "Server Error: Failed to retrieve overview summary",
      err.message,
    );
  }
};

// GET - Category wise summary (analyst, admin, user)
exports.getCategory = async (req, res) => {
  try {
    const summary = await summaryService.getCategoryTotals();
    successResponse(res, 200, "Category summary retrieved successfully", {
      summary,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(
      res,
      500,
      "Server Error: Failed to retrieve category summary",
      err.message,
    );
  }
};

// GET - Trend wise summary ( analyst, admin, user)
exports.getTrends = async (req, res) => {
  try {
    const trend = await summaryService.getTrends();
    successResponse(res, 200, "Trend analysis retrieved successfully", {
      trend,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(
      res,
      500,
      "Server Error: Failed to retrieve trend analysis",
      err.message,
    );
  }
};

module.exports = exports;
