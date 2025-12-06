import { Router } from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware";
import { bookingsController } from "./bookings.controller";

const router = Router();

router.post("/", isAuthenticated(), bookingsController.createBooking);

router.get("/", isAuthenticated(), bookingsController.getAllBookings);

router.put("/:bookingId", isAuthenticated(), bookingsController.updateBooking);

export const bookingRoutes = router;
