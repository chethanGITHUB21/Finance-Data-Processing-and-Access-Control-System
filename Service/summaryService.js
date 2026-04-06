const recordModel = require("../Models/recordModel");
const AppError = require("../util/appError");

async function getOverview() {
  const overview = await recordModel.getOverviewSummary();
  if (!overview) throw new AppError("Overview summary not available", 404);
  return overview;
}

async function getCategoryTotals() {
  const categories = await recordModel.getCategorySummary();
  if (!categories || categories.length === 0) {
    throw new AppError("Category summary not available", 404);
  }
  return categories;
}

async function getTrends() {
  const trends = await recordModel.getTrendSummary();
  if (!trends || trends.length === 0) {
    throw new AppError("Trend summary not available", 404);
  }
  return trends;
}

module.exports = {
  getOverview,
  getCategoryTotals,
  getTrends,
};


