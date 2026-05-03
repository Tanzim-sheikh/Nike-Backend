// product.model.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  brand: { type: String, default: "Nike" },
  description: { type: String, default: "" },
  
  images: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 images allowed'
    }
  },
  
  gender: { type: String, enum: ["MEN", "WOMEN", "KIDS", "UNISEX"], required: true },
  shoeType: { type: String, enum: ["RUNNING", "BASKETBALL", "TENNIS", "GOLF", "SKATEBOARDING", "FOOTBALL", "TRAINING", "LIFESTYLE"], required: true },
  sizes: [{ type: String, required: true }],
  price: { type: Number, required: true, min: 0 },
  sale: { type: Boolean, default: false },
  salePrice: { type: Number, min: 0, default: null },
  is_in_inventory: { type: Boolean, default: true },
  items_left: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);