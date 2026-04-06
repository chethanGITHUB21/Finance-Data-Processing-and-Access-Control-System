const pool = require("../config/dbconfig");

async function getTypes() {
  const result = await pool.query(
    "SELECT id, name FROM types ORDER BY id ASC;",
  );
  return result.rows;
}

async function getCategories() {
  const result = await pool.query(
    "SELECT id, name FROM categories ORDER BY id ASC;",
  );
  return result.rows;
}

module.exports = {
  getTypes,
  getCategories,
};
