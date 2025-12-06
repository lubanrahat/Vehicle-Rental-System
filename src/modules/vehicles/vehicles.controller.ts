import { Request, Response } from "express";
import { vehicleService } from "./vehicles.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.status(200).json({
      success: true,
      message:
        vehicles.length > 0
          ? "Vehicles retrieved successfully"
          : "No vehicles found",
      data:
        vehicles.length > 0
          ? vehicles.map((vehicle) => {
              return {
                id: vehicle.id,
                vehicle_name: vehicle.vehicle_name,
                type: vehicle.type,
                registration_number: vehicle.registration_number,
                daily_rent_price: Math.floor(vehicle.daily_rent_price),
                availability_status: vehicle.availability_status,
              };
            })
          : [],
    });
  } catch (error: any) {
    console.error("Error getting vehicles:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicle = await vehicleService.getVehicleById(
      parseInt(req.params.vehicleId!)
    );
    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (error: any) {
    console.error("Error getting single vehicle:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const vehicle = await vehicleService.updateVehicle(
      parseInt(req.params.vehicleId!),
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    await vehicleService.deleteVehicle(parseInt(req.params.vehicleId!));
    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const vehicleController = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
