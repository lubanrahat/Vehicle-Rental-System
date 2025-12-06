import { pool } from "../config/db";

const autoReturnExpiredBookings = async () => {
  const result = await pool.query(`
    UPDATE bookings
    SET status = 'returned'
    WHERE status = 'booked'
    AND rent_end_date < CURRENT_DATE
    RETURNING vehicle_id;
  `);

  if (result.rows.length > 0) {
    await pool.query(
      `UPDATE vehicles 
       SET availability_status = 'available'
       WHERE id = ANY($1)`,
      [result.rows.map((row) => row.vehicle_id)]
    );
  }
};

export default autoReturnExpiredBookings;
