const rolePermissions = require("../util/rolePermissions");
const { errorResponse } = require("../util/apiResponse");

// Middleware for authorizing users based on their roles and permissions
function authorize(requiredPermission) {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !user.role)
        return errorResponse(res, 401, "Unauthorized: User not authenticated");

      const permissions = rolePermissions[user.role];

      if (!permissions || !permissions.includes(requiredPermission)) {
        return errorResponse(
          res,
          403,
          "Forbidden : You do not have permission to perform this action",
        );
      }

      next();
    } catch (err) {
      errorResponse(
        res,
        500,
        "Server Error: Authorization failed",
        err.message,
      );
    }
  };
}
module.exports = authorize;
