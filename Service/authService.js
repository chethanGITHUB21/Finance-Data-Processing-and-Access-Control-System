const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const AppError = require("../util/appError");

//  Register User (admin, user, analyst)
async function RegisterUser(data) {
  const { username, email, password, role } = data;

  if (!username || !email || !password) {
    throw new AppError("Username, email, and password are required", 400);
  }

  // Check if user already exists
  const existingUser = await userModel.getUserByEmail(email);
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await userModel.createUser({
    username,
    email,
    password: hashedPassword,
    role: role || "VIEWER",
  });

  // Remove password before returning
  delete newUser.password;

  return newUser;
}

// Login User
async function loginUser(email, password) {
  // Check user exists
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await userModel.getUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // Remove password before returning
  delete user.password;

  return user;
}

module.exports = {
  RegisterUser,
  loginUser,
};
