const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    text: { type: String },
    rating: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    images: [{ type: String }],
  },
  { timestamps: true }
);

const ProductSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    img: [{ type: String, required: true }],
    reviews: [ReviewSchema],
    features: [{ type: String }],
    colors: [{ type: String }],
    price: {
      newprice: { type: Number, required: true },
      discount: { type: Number },
      installment: { type: Number },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
