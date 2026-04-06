const { successResponse, errorResponse } = require("../util/apiResponse");
const lookupService = require("../Service/lookupService");

exports.getTypes = async (req, res) => {
  try {
    const types = await lookupService.getTypes();
    successResponse(res, 200, "Types retrieved successfully", { types });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(res, 500, "Failed to retrieve types", err.message);
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await lookupService.getCategories();
    successResponse(res, 200, "Categories retrieved successfully", {
      categories,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(res, 500, "Failed to retrieve categories", err.message);
  }
};
