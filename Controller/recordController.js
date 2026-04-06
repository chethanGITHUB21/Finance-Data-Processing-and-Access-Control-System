// const pool = require("../Models/dbconfig");
const { successResponse, errorResponse } = require("../util/apiResponse");
const recordService = require("../Service/recordService");

// Add a new record
// user can add
exports.addRecord = async (req, res) => {
  const { user_id, amount, type_id, category_id, record_date, description } =
    req.body;

  try {
    const created = await recordService.addRecord(req.body);
    successResponse(res, 201, "Record added successfully", {
      records: created,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(res, 500, "Server Error: Failed to add record", err.message);
  }
};

// Get all records
// admin only can access all records, user can access their own records only
exports.getRecord = async (req, res) => {
  try {
    const result = await recordService.fetchRecords();

    successResponse(res, 200, "Records retrieved successfully", {
      records: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(
      res,
      500,
      "Server Error: Failed to retrieve records",
      err.message,
    );
  }
};

// GET - specific record by ID /getRecord/:id
// admin can access individual record and user can access their own records only
exports.getRecordById = async (req, res) => {
  try {
    const result = await recordService.fetchRecordById(req.params.id);

    if (!result) return errorResponse(res, 404, "Record not found");

    successResponse(res, 200, "Record retrieved successfully", {
      records: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(
      res,
      500,
      "Server Error : Failed to retrieve record",
      err.message,
    );
  }
};

// Update a record by ID /updateRecord/:id
// admin only can update the record
exports.updateRecordById = async (req, res) => {
  try {
    const result = await recordService.modifyRecordById(
      req.params.id,
      req.body,
    );

    if (!result) return errorResponse(res, 404, "Record not found");

    successResponse(res, 200, "Record updated successfully", {
      records: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(
      res,
      500,
      "Server Error: Failed to update record",
      err.message,
    );
  }
};

// Delete a record by ID deleteRecord/:id
// admin only can delete the record
exports.deleteRecordById = async (req, res) => {
  try {
    const result = await recordService.removeRecordById(req.params.id);

    if (!result) return errorResponse(res, 404, "Record not found");

    successResponse(res, 200, "Record deleted Successfully", {
      records: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.statusCode, err.message, err.code || null);
    }
    errorResponse(
      res,
      500,
      "Server Error: Failed to delete record",
      err.message,
    );
  }
};
