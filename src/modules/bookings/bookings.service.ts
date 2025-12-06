import { pool } from "../../config/db";
import autoReturnExpiredBookings from "../../utils/autoReturnExpiredBookings";
import formatDate from "../../utils/formatDate";

interface BookingData {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}
const createBooking = async (data: BookingData) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = data;

  if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
    throw new Error("All fields are required");
  }

  const customer = await pool.query("SELECT * FROM users WHERE id = $1", [
    customer_id,
  ]);

  if (customer.rows.length === 0) {
    throw new Error("Customer not found");
  }

  const vehicle = await pool.query("SELECT * FROM vehicles WHERE id = $1", [
    vehicle_id,
  ]);

  if (vehicle.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.rows[0].availability_status === "booked") {
    throw new Error("Vehicle is already booked");
  }

  if (rent_start_date > rent_end_date) {
    throw new Error("Start date must be before end date");
  }

  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);

  const duration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalPrice = vehicle.rows[0].daily_rent_price * duration;

  const bookingResult = await pool.query(
    "INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      totalPrice,
      "active",
    ]
  );

  await pool.query(
    "UPDATE vehicles SET availability_status = 'booked' WHERE id = $1",
    [vehicle_id]
  );

  return {
    id: bookingResult.rows[0].id,
    customer_id: customer_id,
    vehicle_id: vehicle_id,
    rent_start_date: formatDate(rent_start_date),
    rent_end_date: formatDate(rent_end_date),
    total_price: totalPrice,
    status: bookingResult.rows[0].status,
    vehicle: {
      vehicle_name: vehicle.rows[0].vehicle_name,
      daily_rent_price: Math.floor(vehicle.rows[0].daily_rent_price),
    },
  };
};

const getAllBookings = async (userId: number, userRole: string) => {
  await autoReturnExpiredBookings();
  if (userRole === "admin") {
    const result = await pool.query(`
      SELECT 
        b.id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        u.name as customer_name,
        u.email as customer_email,
        v.vehicle_name,
        v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id DESC
    `);

    return result.rows.map((row) => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: formatDate(row.rent_start_date),
      rent_end_date: formatDate(row.rent_end_date),
      total_price: row.total_price,
      status: row.status,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
      },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: Math.floor(row.registration_number),
      },
    }));
  } else if (userRole === "customer") {
    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id DESC
    `,
      [userId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      rent_start_date: formatDate(row.rent_start_date),
      rent_end_date: formatDate(row.rent_end_date),
      total_price: row.total_price,
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    }));
  }

  throw new Error("Unauthorized: User does not have the required role");
};

const updateBooking = async (
  bookingId: number,
  data: { status: string },
  userId: number,
  userRole: string
) => {
  await autoReturnExpiredBookings();
  if (!["admin", "customer"].includes(userRole)) {
    throw new Error("Unauthorized: User role not allowed");
  }

  const bookingQuery = await pool.query(
    "SELECT * FROM bookings WHERE id = $1",
    [bookingId]
  );

  if (bookingQuery.rows.length === 0) {
    throw new Error("Booking not found");
  }

  const booking = bookingQuery.rows[0];

  if (userRole === "customer" && data.status === "cancelled") {
    if (booking.customer_id !== userId) {
      throw new Error("Unauthorized: You can only cancel your own bookings");
    }

    const startDate = new Date(booking.rent_start_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (startDate <= now) {
      throw new Error("Cannot cancel booking on or after the start date.");
    }

    await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [
      bookingId,
    ]);

    await pool.query(
      "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
      [booking.vehicle_id]
    );

    const updatedBooking = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [bookingId]
    );

    return {
      id: updatedBooking.rows[0].id,
      customer_id: updatedBooking.rows[0].customer_id,
      vehicle_id: updatedBooking.rows[0].vehicle_id,
      rent_start_date: formatDate(updatedBooking.rows[0].rent_start_date),
      rent_end_date: formatDate(updatedBooking.rows[0].rent_end_date),
      total_price: Math.floor(updatedBooking.rows[0].total_price),
      status: updatedBooking.rows[0].status,
    };
  }

  if (userRole === "admin" && data.status === "returned") {
    await pool.query("UPDATE bookings SET status = 'returned' WHERE id = $1", [
      bookingId,
    ]);

    await pool.query(
      "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
      [booking.vehicle_id]
    );

    const updatedBooking = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [bookingId]
    );

    const vehicle = await pool.query(
      "SELECT availability_status FROM vehicles WHERE id = $1",
      [booking.vehicle_id]
    );

    return {
      id: updatedBooking.rows[0].id,
      customer_id: updatedBooking.rows[0].customer_id,
      vehicle_id: updatedBooking.rows[0].vehicle_id,
      rent_start_date: formatDate(updatedBooking.rows[0].rent_start_date),
      rent_end_date: formatDate(updatedBooking.rows[0].rent_end_date),
      total_price: Math.floor(updatedBooking.rows[0].total_price),
      status: updatedBooking.rows[0].status,
      vehicle: {
        availability_status: vehicle.rows[0].availability_status,
      },
    };
  }

  throw new Error(
    "Invalid action. Customer can cancel only. Admin can only mark as returned."
  );
};

export const bookingsService = {
  createBooking,
  getAllBookings,
  updateBooking,
};
