import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true }, // sale price or original price
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true }, // in INR
  paymentId: { type: String, required: true, unique: true }, // Razorpay payment ID
  razorpayOrderId: { type: String, required: true },
  razorpaySignature: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date, default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }, // 3 days later
  status: { type: String, enum: ["confirmed", "processing", "shipped", "delivered", "cancelled"], default: "confirmed" },
  address: {
    mobile: String,
    houseNo: String,
    addressLine: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
  },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
