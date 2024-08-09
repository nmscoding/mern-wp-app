const mongoose = require("mongoose");

const SliderSchema = mongoose.Schema(
  {
    img: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
  },
  { timestamps: true }
);

const Slider = mongoose.model("Slider", SliderSchema);

module.exports = Slider;
