const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");
const RateLimiter = require("express-rate-limit");
const {
  validate,
  registrationValidationRules,
  loginValidationRules,
} = require("../Middleware/validation");

// POST - Register a new user
router.post(
  "/register",
  RateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  registrationValidationRules,
  validate,
  authController.register,
);

// POST - Login for user
router.post(
  "/login",
  RateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  loginValidationRules,
  validate,
  authController.login,
);

module.exports = router;
