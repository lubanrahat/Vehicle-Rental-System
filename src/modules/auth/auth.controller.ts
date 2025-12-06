import { Request, Response } from "express";
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const signin = async (req: Request, res: Response) => {
  try {
    const user = await authService.signin(req.body);
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error: any) {
    console.error("Error signing in user:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const authController = {
  signup,
  signin,
};
