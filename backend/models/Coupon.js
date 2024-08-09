const mongoose = require("mongoose");

const CouponSchema = mongoose.Schema(
  {
    code: { type: String, required: true },
    discountValue: { type: Number, required: true },
    discountType: { type: String, required: true, enum: ["percent", "amount"] },
    expiryDate: { type: Date, required: true },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    minimumSpend: { type: Number, required: true },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", CouponSchema);

module.exports = Coupon;
