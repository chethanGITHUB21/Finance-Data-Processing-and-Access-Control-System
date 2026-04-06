const recordModel = require("../Models/recordModel");
const AppError = require("../util/appError");

async function addRecord(data) {
  if (
    !data ||
    !("user_id" in data) ||
    !("amount" in data) ||
    !("type_id" in data) ||
    !("category_id" in data) ||
    !("record_date" in data)
  ) {
    throw new AppError(
      "Missing required record fields: user_id, amount, type_id, category_id, record_date",
      400,
    );
  }

  const record = await recordModel.createRecord(data);
  if (!record) throw new AppError("Failed to add record", 500);
  return record;
}

async function fetchRecords() {
  const records = await recordModel.getRecords();
  return records;
}

async function fetchRecordById(id) {
  const record = await recordModel.getRecordById(id);
  return record;
}

async function modifyRecordById(id, data) {
  const existing = await recordModel.getRecordById(id);
  if (!existing) throw new AppError("Record not found", 404);

  const updated = await recordModel.updateRecordById(id, data);
  return updated;
}

async function removeRecordById(id) {
  const deleted = await recordModel.deleteRecordById(id);
  if (!deleted) throw new AppError("Record not found", 404);
  return deleted;
}

module.exports = {
  addRecord,
  fetchRecords,
  fetchRecordById,
  modifyRecordById,
  removeRecordById,
};
