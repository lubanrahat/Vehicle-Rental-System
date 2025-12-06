import { pool } from "../../config/db";

interface updateUserData {
  name: string,
  email: string,
  phone: string
  role?: string
}

const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT id, name, email, phone, role FROM users ORDER BY id"
  );
  return result.rows;
};


const updateUser = async (
  userId: number,
  data: updateUserData,
  requestingUserId: number,
  requestingUserRole: string
) => {
  console.log(data)
  const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);

  if (userCheck.rows.length === 0) {
    throw new Error("User not found");
  }

  if (!["admin", "customer"].includes(requestingUserRole)) {
    throw new Error("Unauthorized: User does not have the required role");
  }

  if (requestingUserRole === "admin") {
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, phone = $3, role = $4 
       WHERE id = $5
       RETURNING *`,
      [data.name, data.email, data.phone, data.role, userId]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      role: result.rows[0].role,
    };
  }

  if (requestingUserRole === "customer" && requestingUserId === userId) {
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, phone = $3 
       WHERE id = $4
       RETURNING *`,
      [data.name, data.email, data.phone, userId]
    );

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      role: result.rows[0].role,
    };
  }

  throw new Error("Unauthorized: You can update only your own profile");
};

const deleteUser = async (userId: number) => {

  const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);

  if (userCheck.rows.length === 0) {
    throw new Error("User not found");
  }

  const bookingCheck = await pool.query(
    "SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'",
    [userId]
  );

  if (bookingCheck.rows.length > 0) {
    throw new Error("Cannot delete user with active bookings");
  }

  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
};

export const userService = {
  getAllUsers,
  updateUser,
  deleteUser,
};
