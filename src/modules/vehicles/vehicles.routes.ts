import { Router } from "express";
import { authorize, isAuthenticated } from "../../middlewares/auth.middleware";
import { vehicleController } from "./vehicles.controller";

const router = Router();

router.post(
  "/",
  isAuthenticated(),
  authorize("admin"),
  vehicleController.createVehicle
);
router.get("/", vehicleController.getAllVehicles);
router.get("/:vehicleId", vehicleController.getVehicleById);

router.put(
  "/:vehicleId",
  isAuthenticated(),
  authorize("admin"),
  vehicleController.updateVehicle
);

router.delete(
  "/:vehicleId",
  isAuthenticated(),
  authorize("admin"),
  vehicleController.deleteVehicle
);

export const vehicleRoutes = router;
