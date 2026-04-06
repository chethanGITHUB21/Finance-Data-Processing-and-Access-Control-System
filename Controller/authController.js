const jwt = require("jsonwebtoken");
const authService = require("../Service/authService");
const JWT_SECRET = process.env.JWT_SECRET || "sUPERsECRETkEY";
const { successResponse, errorResponse } = require("../util/apiResponse");

// User Registration
exports.register = async (req, res) => {
  try {
    const newUser = await authService.RegisterUser(req.body);
    successResponse(res, 201, "User registration successful", {
      userId: newUser.id,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(res, 500, "Server Error: Registration failed", err.message);
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const user = await authService.loginUser(req.body.email, req.body.password);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    successResponse(res, 200, "Login successful", {
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(res, 500, "Server Error: Login failed", err.message);
  }
};
