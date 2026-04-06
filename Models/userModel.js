const pool = require("../config/dbconfig");

// Create user ( admin only)
async function createUser(data) {
  const query = `
    INSERT INTO users (username, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [data.username, data.email, data.password, data.role];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// GET - all the users (admin and analyst)
async function getUsers() {
  const result = await pool.query(
    "SELECT id, username, email, role, status, created_at FROM users;",
  );
  return result.rows;
}

// Get user by email (admin only)
async function getUserByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1;", [
    email,
  ]);
  return result.rows[0];
}

// Get user by ID (admin only)
async function getUserById(id) {
  const result = await pool.query(
    "SELECT username, email, role, status, created_at FROM users WHERE id = $1;",
    [id],
  );
  return result.rows[0];
}

// Update user (flexible fields , admin only)
async function updateUser(userId, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.username !== undefined) {
    fields.push(`username = $${idx++}`);
    values.push(data.username);
  }

  if (data.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(data.email);
  }

  if (data.role !== undefined) {
    fields.push(`role = $${idx++}`);
    values.push(data.role);
  }

  if (data.password !== undefined) {
    fields.push(`password = $${idx++}`);
    values.push(data.password);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(data.status);
  }

  if (fields.length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING *;
  `;

  values.push(userId);

  const result = await pool.query(query, values);
  return result.rows[0];
}

// Delete user ( admin only )
async function deleteUser(userId) {
  await pool.query("DELETE FROM users WHERE id = $1;", [userId]);
}

module.exports = {
  createUser,
  getUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
};
