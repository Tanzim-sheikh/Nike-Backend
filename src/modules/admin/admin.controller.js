import { adminLoginService } from "./admin.service.js";
import { success, error } from "../../common/response.js";
import Order from "../orders/order.model.js";
import Product from "../product/product.model.js";
import User from "../user/user.model.js";

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password, secretKey } = req.body;
    if (!email || !password || !secretKey) {
      return error(res, "Email, password and secret key are required", 400);
    }
    const result = await adminLoginService(email, password, secretKey);
    return success(res, result, "Admin login successful");
  } catch (err) {
    next(err);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      lowStock,
      outOfStock,
      totalOrders,
      deliveredOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ items_left: { $gt: 0, $lt: 5 } }),
      Product.countDocuments({ items_left: { $lte: 0 } }),
      Order.countDocuments(),
      Order.countDocuments({ status: "delivered" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]),
      Order.find()
        .populate("user", "name surname email")
        .sort({ orderDate: -1 })
        .limit(5),
    ]);

    return success(res, {
      totalUsers,
      totalProducts,
      lowStock,
      outOfStock,
      totalOrders,
      deliveredOrders,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      recentOrders,
    }, "Dashboard stats fetched");
  } catch (err) {
    next(err);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password -verificationToken -tokenExpires -resetPasswordToken -resetTokenExpires")
      .sort({ createdAt: -1 });
    return success(res, users, "Users fetched");
  } catch (err) {
    next(err);
  }
};
