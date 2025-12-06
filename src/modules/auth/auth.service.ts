import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "customer";
}

interface SigninData {
  email: string;
  password: string;
}

const signup = async (data: SignupData) => {
  const { name, email, password, phone, role } = data;

  if (!name || !email || !password || !phone || !role) {
    throw new Error("All fields are required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new Error("Invalid email format");
  }

  const exgistingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  
  if (exgistingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  if (!["admin", "customer"].includes(role)) {
    throw new Error("Invalid role");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const reault = await pool.query(
    "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, email, hashedPassword, phone, role]
  );
  return {
    id: reault.rows[0].id,
    name: reault.rows[0].name,
    email: reault.rows[0].email,
    phone: reault.rows[0].phone,
    role: reault.rows[0].role,
  };
};

const signin = async (data: SigninData) => {
  const { email, password } = data;
  
  if (!email || !password) {
    throw new Error("All fields are required");
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new Error("Invalid email format");
  }

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (user.rows.length === 0) {
    throw new Error("User not found");
  }

  const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7h" }
  );

  return {
    token,
    user: {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      phone: user.rows[0].phone,
      role: user.rows[0].role,
    },
  };
};

export const authService = {
  signup,
  signin,
};
