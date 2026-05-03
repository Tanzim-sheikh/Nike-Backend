import { Router } from "express";

import userRoutes from "../modules/user/user.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import paymentRoutes from '../modules/payment/payment.routes.js';
import orderRoutes from '../modules/orders/order.routes.js';

const router = Router();

router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/products", productRoutes);
router.use('/payment', paymentRoutes);
router.use("/orders", orderRoutes);

export default router;
