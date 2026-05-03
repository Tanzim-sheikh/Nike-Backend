// src/modules/admin/admin.routes.js
import { Router } from "express";
import { adminLogin, getAdminDashboard, getAdminUsers } from "./admin.controller.js";
import { verifyAdmin } from "../../middleware/adminAuth.js";
import Admin from "./admin.model.js";   // ✅ Import Admin model

const router = Router();

// ⚠️ Temporary route – only for creating first admin (remove after use)
router.post("/create", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const admin = new Admin({ email, password, name: name || "Super Admin" });
    await admin.save();
    res.status(201).json({ message: "Admin created", admin: { email: admin.email, name: admin.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", adminLogin);
router.get("/dashboard", verifyAdmin, getAdminDashboard);
router.get("/users", verifyAdmin, getAdminUsers);

export default router;
