const rolePermissions = {
  VIEWER: ["VIEW_SUMMARY", "READ_RECORD"],

  ANALYST: ["READ_PROFILE", "READ_RECORD", "VIEW_SUMMARY"],

  ADMIN: [
    "READ_PROFILE",
    "CREATE_PROFILE",
    "UPDATE_PROFILE",
    "DELETE_PROFILE",
    "READ_RECORD",
    "CREATE_RECORD",
    "UPDATE_RECORD",
    "DELETE_RECORD",
    "VIEW_SUMMARY",
  ],
};

module.exports = rolePermissions;
