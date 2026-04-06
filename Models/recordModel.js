const pool = require("../config/dbconfig");

async function createRecord(data) {
  const query = ` 
    INSERT INTO records (user_id, amount, type_id, category_id, record_date, description)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
  ;`;
  const values = [
    data.user_id,
    data.amount,
    data.type_id,
    data.category_id,
    data.record_date,
    data.description,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getRecords() {
  const result = await pool.query(
    "SELECT * FROM records WHERE is_deleted = false ORDER BY record_date DESC",
  );
  return result.rows;
}

async function getRecordById(recordId) {
  const result = await pool.query(
    "SELECT * FROM records WHERE id = $1 AND is_deleted = false",
    [recordId],
  );
  return result.rows[0];
}

async function updateRecordById(recordId, data) {
  const query = `UPDATE records
    SET amount = $1,
        type_id = $2,
        category_id = $3,
        record_date = $4,
        description = $5
    WHERE id = $6
    RETURNING *
  ;`;
  const values = [
    data.amount,
    data.type_id,
    data.category_id,
    data.record_date,
    data.description,
    recordId,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Soft Delete
async function deleteRecordById(recordId) {
  const result = await pool.query(
    "UPDATE records SET is_deleted = true, deleted_at = NOW() WHERE id = $1 RETURNING *",
    [recordId],
  );
  return result.rows[0];
}

async function getOverviewSummary() {
  const query = `SELECT
      COALESCE(SUM(CASE WHEN t.name = 'INCOME' THEN r.amount ELSE 0 END), 0)::numeric AS total_income,
      COALESCE(SUM(CASE WHEN t.name = 'EXPENSE' THEN r.amount ELSE 0 END), 0)::numeric AS total_expense,
      COALESCE(
        SUM(CASE WHEN t.name = 'INCOME' THEN r.amount ELSE 0 END) -
        SUM(CASE WHEN t.name = 'EXPENSE' THEN r.amount ELSE 0 END),
        0
      )::numeric AS total_netbalance
    FROM records r
    JOIN types t ON r.type_id = t.id WHERE is_deleted = false
  ;`;
  const result = await pool.query(query);
  return result.rows[0];
}

async function getCategorySummary() {
  const query = `SELECT c.name AS category,
           COALESCE(SUM(CASE WHEN t.name = 'INCOME' THEN r.amount ELSE 0 END),0)::numeric AS total_income,
           COALESCE(SUM(CASE WHEN t.name = 'EXPENSE' THEN r.amount ELSE 0 END),0)::numeric AS total_expense
    FROM records r
    JOIN types t ON r.type_id = t.id
    JOIN categories c ON r.category_id = c.id WHERE is_deleted = false
    GROUP BY c.name
    ORDER BY total_income DESC 
  ;`;
  const result = await pool.query(query);
  return result.rows;
}

async function getTrendSummary() {
  const query = `SELECT date_trunc('month', r.record_date)::date AS month,
           COALESCE(SUM(CASE WHEN t.name = 'INCOME' THEN r.amount ELSE 0 END),0)::numeric AS total_income,
           COALESCE(SUM(CASE WHEN t.name = 'EXPENSE' THEN r.amount ELSE 0 END),0)::numeric AS total_expense
    FROM records r
    JOIN types t ON r.type_id = t.id WHERE is_deleted = false 
    GROUP BY month
    ORDER BY month
  ;`;
  const result = await pool.query(query);
  return result.rows;
}

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecordById,
  deleteRecordById,
  getOverviewSummary,
  getCategorySummary,
  getTrendSummary,
};
