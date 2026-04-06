const router = require("express").Router();
const authorize = require("../Middleware/authorization");
const { verifyToken } = require("../Middleware/authentication");

const recordsController = require("../Controller/recordController");

//  Add a new record (admin only)
router.post(
  "/",
  verifyToken,
  authorize("CREATE_RECORD"),
  recordsController.addRecord,
);
// Get - all records (admin and analyst)
router.get(
  "/get",
  verifyToken,
  authorize("READ_RECORD"),
  recordsController.getRecord,
);
// Get -  record by ID (admin only)
router.get(
  "/get/:id",
  verifyToken,
  authorize("READ_RECORD"),
  recordsController.getRecordById,
);
// PUT - Update a record by ID (admin only)
router.put(
  "/update/:id",
  verifyToken,
  authorize("UPDATE_RECORD"),
  recordsController.updateRecordById,
);
//  DELETE - Delete a record by ID (admin only)
router.delete(
  "/delete/:id",
  verifyToken,
  authorize("DELETE_RECORD"),
  recordsController.deleteRecordById,
);

module.exports = router;
