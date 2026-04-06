const jwt = require("jsonwebtoken");
const { errorResponse } = require("../util/apiResponse");
const JWT_SECRET = process.env.JWT_SECRET || "sUPERsECRETkEY";

// Middleware for verifying JWT token and authenticate users
exports.verifyToken = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ message: "Access Denied, No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    errorResponse(res, 403, "Invalid Token");
  }
};
