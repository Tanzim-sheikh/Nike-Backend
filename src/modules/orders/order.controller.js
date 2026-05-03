import crypto from "crypto";
import {
  createOrderService,
  getAllOrdersService,
  getUserOrdersService,
  updateOrderStatusService,
} from "./order.service.js";
import { success, error } from "../../common/response.js";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "../../utils/emailService.js";

export const createOrder = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      paymentId,
      razorpaySignature,
      items,
      totalAmount,
      address,
    } = req.body;

    if (!razorpayOrderId || !paymentId || !razorpaySignature) {
      return error(res, "Payment verification data is required", 400);
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return error(res, "Payment verification failed", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return error(res, "Order must contain at least one item", 400);
    }

    const orderData = {
      user: req.user.userId,
      items,
      totalAmount,
      address,
      paymentId,
      razorpayOrderId,
      razorpaySignature,
    };
    const order = await createOrderService(orderData);
    const userEmail = req.user.email;
    try {
      await sendOrderConfirmationEmail(userEmail, order);
      await sendAdminOrderNotification(order, userEmail);
    } catch (emailError) {
      console.error("Order email notification failed:", emailError.message);
    }
    return success(res, order, "Order placed successfully");
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await getUserOrdersService(req.user.userId);
    return success(res, orders, "Orders fetched");
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await getAllOrdersService();
    return success(res, orders, "Orders fetched");
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await updateOrderStatusService(req.params.id, req.body.status);
    return success(res, order, "Order status updated");
  } catch (err) {
    next(err);
  }
};
