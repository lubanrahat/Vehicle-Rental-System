import { pool } from "../../config/db";

interface VehicleData {
  vehicle_name: string;
  type: "car" | "bike" | "van" | "SUV";
  registration_number: string;
  daily_rent_price: number;
  availability_status: "available" | "booked";
}

const createVehicle = async (data: VehicleData) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = data;

  if (
    !vehicle_name ||
    !type ||
    !registration_number ||
    !daily_rent_price ||
    !availability_status
  ) {
    throw new Error("All fields are required");
  }

  if (!["car", "bike", "van", "SUV"].includes(type)) {
    throw new Error("Invalid vehicle type");
  }

  if (daily_rent_price < 0) {
    throw new Error("Invalid daily rent price");
  }

  if (!["available", "booked"].includes(availability_status)) {
    throw new Error("Invalid availability status");
  }

  const result = await pool.query(
    "INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );
  return {
    id: result.rows[0].id,
    vehicle_name: result.rows[0].vehicle_name,
    type: result.rows[0].type,
    registration_number: result.rows[0].registration_number,
    daily_rent_price: Math.floor(result.rows[0].daily_rent_price),
    availability_status: result.rows[0].availability_status,
  };
};

const getAllVehicles = async () => {
  const result = await pool.query("SELECT * FROM vehicles");
  return result.rows;
};

const getVehicleById = async (id: number) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    throw new Error("Vehicle not found");
  }
  return {
    id: result.rows[0].id,
    vehicle_name: result.rows[0].vehicle_name,
    type: result.rows[0].type,
    registration_number: result.rows[0].registration_number,
    daily_rent_price: Math.floor(result.rows[0].daily_rent_price),
    availability_status: result.rows[0].availability_status,
  };
};

const updateVehicle = async (id: number, data: VehicleData) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = data;

  const existingVehicle = await pool.query(
    "SELECT * FROM vehicles WHERE id = $1",
    [id]
  );
  if (existingVehicle.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const result = await pool.query(
    "UPDATE vehicles SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5 WHERE id = $6 RETURNING *",
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
      id,
    ]
  );
  return {
    id: result.rows[0].id,
    vehicle_name: result.rows[0].vehicle_name,
    type: result.rows[0].type,
    registration_number: result.rows[0].registration_number,
    daily_rent_price: Math.floor(result.rows[0].daily_rent_price),
    availability_status: result.rows[0].availability_status,
  };
};

const deleteVehicle = async (id: number) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const bookingsCheck = await pool.query(
    "SELECT COUNT(*) as booking_count FROM bookings WHERE vehicle_id = $1",
    [id]
  );

  const bookingCount = parseInt(bookingsCheck.rows[0].booking_count);
  
  if (bookingCount > 0) {
    throw new Error(
      "Cannot delete vehicle with existing bookings. Please cancel the bookings first."
    );
  }

  await pool.query("DELETE FROM vehicles WHERE id = $1", [id]);
};

export const vehicleService = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
