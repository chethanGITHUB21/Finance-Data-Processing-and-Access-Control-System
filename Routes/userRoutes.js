const express = require("express");
const router = express.Router();
const authorize = require("../Middleware/authorization");
const { verifyToken } = require("../Middleware/authentication");
const routeUser = require("../Controller/userController");

// GET - user profile by id (admin only)
router.get(
  "/:id",
  verifyToken,
  authorize("READ_PROFILE"),
  routeUser.getProfile,
);
// GET - all users (admin)
router.get(
  "/",
  verifyToken,
  authorize("READ_PROFILE"),
  routeUser.getAllProfile,
);

// POST - update user profile (admin)
router.post(
  "/",
  verifyToken,
  authorize("CREATE_PROFILE"),
  routeUser.createUser,
);

// PUT - update user profile (admin )
router.put(
  "/:id",
  verifyToken,
  authorize("UPDATE_PROFILE"),
  routeUser.updateUser,
);

// DELETE - delete a user ( admin only)
router.delete(
  "/:id",
  verifyToken,
  authorize("DELETE_PROFILE"),
  routeUser.deleteUser,
);

module.exports = router;
