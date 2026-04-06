const lookupModel = require("../Models/lookupModel");
const AppError = require("../util/appError");

async function getTypes() {
  const types = await lookupModel.getTypes();
  if (!types || types.length === 0) {
    throw new AppError("Types not found", 404);
  }
  return types;
}

async function getCategories() {
  const categories = await lookupModel.getCategories();
  if (!categories || categories.length === 0) {
    throw new AppError("Categories not found", 404);
  }
  return categories;
}

module.exports = {
  getTypes,
  getCategories,
};
