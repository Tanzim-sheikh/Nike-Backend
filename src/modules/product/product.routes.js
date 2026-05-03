import { Router } from "express";
import { verifyAdmin } from "../../middleware/adminAuth.js";
import { addProduct, getAllProducts, getProduct, updateProduct, deleteProduct } from "./product.controller.js";
import { uploadMultiple } from "../../middleware/upload.js";

const router = Router();

// ✅ Add uploadMultiple middleware before controller
router.post("/", verifyAdmin, uploadMultiple, addProduct);
router.put("/:id", verifyAdmin, updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);
router.get("/", getAllProducts);
router.get("/:id", getProduct);

export default router;