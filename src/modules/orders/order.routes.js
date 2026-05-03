import { Router } from "express";
import { createOrder, getAllOrders, getUserOrders, updateOrderStatus } from "./order.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { verifyAdmin } from "../../middleware/adminAuth.js";

const router = Router();
router.post("/", authenticate, createOrder);
router.get("/", authenticate, getUserOrders);
router.get("/admin", verifyAdmin, getAllOrders);
router.patch("/:id/status", verifyAdmin, updateOrderStatus);

export default router;
