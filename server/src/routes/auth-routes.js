import express from "express";

import AuthController from "../service/auth-service.js";


const router = express.Router();
const authController = new AuthController();

router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post("/logout", authController.logout.bind(authController));

export default router;