const { successResponse, errorResponse } = require("../util/apiResponse");
const userService = require("../Service/userService");

// POST - create a new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const result = await userService.createUser(req.body);
    successResponse(res, 201, "User created successfully", {
      userId: result.id,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(res, 500, "Server Error: Failed to create user", err.message);
  }
};

// GET - user profile (admin only)
exports.getProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfileById(req.params.id);
    successResponse(res, 200, "User profile retrieved successfully", { user });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(
      res,
      500,
      "Server Error: Failed to retrieve user profile",
      err.message,
    );
  }
};

// GET - all user profiles (admin and analyst)
exports.getAllProfile = async (req, res) => {
  try {
    const data = await userService.getUserProfile();
    successResponse(res, 200, "User profile retrieval successfully", { data });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(res, 500, "Failed to retrieve users", err.message);
  }
};

// PUT- updating user profile (admin only)
exports.updateUser = async (req, res) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    successResponse(res, 201, "User Updated successfully", {
      userId: result.id,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(res, 500, "Server Error: Failed to update user", err.message);
  }
};

// DELETE - delete a user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    successResponse(res, 200, "User successfullY DELETED", {
      result,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(res, 500, "Server Error: Failed to delete user", err.message);
  }
};
