import { Request, Response } from "express";
import { bookingsService } from "./bookings.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const booking = await bookingsService.createBooking(req.body);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await bookingsService.getAllBookings(
      req.user!.id,
      req.user!.role
    );

    const message =
      req.user!.role === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully";

    res.status(200).json({
      success: true,
      message: message,
      data: bookings,
    });
  } catch (error: any) {
    console.error("Error getting bookings:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const booking = await bookingsService.updateBooking(
      parseInt(req.params.bookingId!),
      req.body,
      req.user!.id,
      req.user!.role
    );
    
    let message = "Booking updated successfully";
    if (req.body.status === "cancelled") {
      message = "Booking cancelled successfully";
    } else if (req.body.status === "returned") {
      message = "Booking marked as returned. Vehicle is now available";
    }

    res.status(200).json({
      success: true,
      message: message,
      data: booking,
    });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bookingsController = {
  createBooking,
  getAllBookings,
  updateBooking,
};
