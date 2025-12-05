import express from "express";
import AuthController from "../controller/auth-controller.js";
import { authenticateToken } from "../middleware/auth-middleware.js";

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post("/register", authController.register.bind(authController));
router.post("/verify-email", authController.verifyEmail.bind(authController));
router.post("/verify-phone", authController.verifyPhone.bind(authController));
router.post("/resend-email-code", authController.resendEmailCode.bind(authController));
router.post("/resend-phone-code", authController.resendPhoneCode.bind(authController));
router.post("/login", authController.login.bind(authController));

// Protected routes
router.get("/me", authenticateToken, authController.me.bind(authController));
router.post("/logout", authenticateToken, authController.logout.bind(authController));

export default router;
