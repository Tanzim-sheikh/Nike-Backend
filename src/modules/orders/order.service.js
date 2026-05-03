import Order from "./order.model.js";
import Product from "../product/product.model.js";

export const createOrderService = async (orderData) => {
  const existingOrder = await Order.findOne({ paymentId: orderData.paymentId });
  if (existingOrder) return existingOrder;

  for (const item of orderData.items) {
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        items_left: { $gte: item.quantity },
      },
      { $inc: { items_left: -item.quantity } },
      { new: true }
    );

    if (!updatedProduct) {
      const error = new Error(`${item.name} does not have enough stock`);
      error.status = 400;
      throw error;
    }
  }

  const order = new Order(orderData);
  await order.save();
  return order;
};

export const getUserOrdersService = async (userId) => {
  return await Order.find({ user: userId }).sort({ orderDate: -1 });
};

export const getAllOrdersService = async () => {
  return await Order.find()
    .populate("user", "name surname email")
    .sort({ orderDate: -1 });
};

export const updateOrderStatusService = async (orderId, status) => {
  const allowedStatuses = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    const error = new Error("Invalid order status");
    error.status = 400;
    throw error;
  }

  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });
  if (!order) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }
  return order;
};
