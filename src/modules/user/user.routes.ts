import { Router } from "express";
import { authorize, isAuthenticated } from "../../middlewares/auth.middleware";
import { userController } from "./user.controller";

const router = Router();

router.get(
  "/",
  isAuthenticated(),
  authorize("admin"),
  userController.getAllUsers
);

router.put(
  "/:userId",
  isAuthenticated(),
  authorize("admin", "customer"),
  userController.updateUser
);

router.delete(
  "/:userId",
  isAuthenticated(),
  authorize("admin"),
  userController.deleteUser
);

export const userRoutes = router;
