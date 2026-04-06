const { validationResult, body } = require("express-validator");
const { errorResponse } = require("../util/apiResponse");

exports.registrationValidationRules = [
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 chracters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character"),
];

exports.loginValidationRules = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Middleware for validating user input
exports.validate = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, "Validation Error", {
      errors: errors.array(),
    });
  }
  next();
};
