const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    buyer: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      surname: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: {
        addressname: { type: String, required: true },
        province: { type: String, required: true },
        town: { type: String, required: true },
        district: { type: String, required: true },
        neighbourhood: { type: String, required: true },
        addressdesc: { type: String, required: true },
      },
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, default: "Sipariş Alındı" },
    orderNumber: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
