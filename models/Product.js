import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
  },
  quantity: {
    type: Number,
    min: 0,
  },
  brand: {
    type: String,
  },
  category: {
    type: String,
    enum: ["Mouse", "Mousepad", "Mousefeet"],
    default: "Mouse",
  },
  description: {
    type: String,
  },
  imgUrl: {
    type: String,
  },
  isDeleted: {
    type: Date,
    default: null,
  },
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
