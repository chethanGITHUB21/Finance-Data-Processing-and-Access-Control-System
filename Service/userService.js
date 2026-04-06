const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const AppError = require("../util/appError");

//  Create User (Admin only)
async function createUser(data) {
  const { username, email, password, role } = data;
  if (data.status) data.status = String(data.status).toUpperCase();

  if (!username || !email || !password) {
    throw new AppError("Username, email, and password are required", 400);
  }

  // 2. Check if user already exists
  const existingUser = await userModel.getUserByEmail(email);
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create user
  const newUser = await userModel.createUser({
    username,
    email,
    password: hashedPassword,
    role: role || "VIEWER",
  });

  return newUser;
}

// Get User Profile
async function getUserProfileById(userId) {
  const user = await userModel.getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

// GET - get all the profiles
async function getUserProfile() {
  const data = await userModel.getUsers();

  if (!data || data.length === 0) throw new AppError("No users found", 404);

  return data;
}

// Update User
async function updateUser(userId, data) {
  // NOTE: You need update query in model for this

  const user = await userModel.getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Optional: hash password if updating
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  if (data.status) data.status = String(data.status).toUpperCase();

  // You will implement this in model later
  const updatedUser = await userModel.updateUser(userId, data);

  delete updatedUser.password;

  return updatedUser;
}

// Delete User
async function deleteUser(userId) {
  const user = await userModel.getUserById(userId);

  if (!user || user.length === 0) {
    throw new AppError("User not found", 404);
  }

  // You will implement this in model later
  await userModel.deleteUser(userId);

  return { message: "User deleted successfully" };
}

module.exports = {
  createUser,
  getUserProfileById,
  getUserProfile,
  updateUser,
  deleteUser,
};
