const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const Coupon = require("../models/Coupon");

// Middleware
router.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// CSRF Token Endpoint
router.get("/csrf-token", csrfProtection, (req, res) => {
  res.cookie("XSRF-TOKEN", req.csrfToken(), { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
  res.json({ csrfToken: req.csrfToken() });
});

// Create Coupon
router.post("/", authMiddleware, csrfProtection, async (req, res) => {
  try {
    const { code, discountValue, discountType, expiryDate, minimumSpend } = req.body;
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) return res.status(400).json({ error: "Bu kupon kodu geçersiz ya da kullanılmış" });

    const newCoupon = new Coupon({ code, discountValue, discountType, expiryDate, minimumSpend });
    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Delete Coupon
router.delete("/:couponId", authMiddleware, csrfProtection, async (req, res) => {
  try {
    const couponId = req.params.couponId;
    if (!mongoose.Types.ObjectId.isValid(couponId)) return res.status(400).json({ error: "Invalid coupon ID format" });

    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
    if (!deletedCoupon) return res.status(404).json({ error: "Coupon not found." });

    res.status(200).json(deletedCoupon);
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ error: `Server error: ${error.message}`, details: error });
  }
});

// Apply Coupon
router.post("/use/:couponCode?", authMiddleware, csrfProtection, async (req, res) => {
  try {
    const couponCode = req.params.couponCode;
    const userId = req.user.id;
    const { cartTotal } = req.body;

    if (!couponCode) {
      return res.status(200).json({ discountAmount: 0, discountType: null, cartTotal, discountedTotal: cartTotal.toFixed(2) });
    }

    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) return res.status(404).json({ error: "Coupon not found." });

    if (new Date() > new Date(coupon.expiryDate)) return res.status(400).json({ error: "Coupon expired." });
    if (coupon.usedBy.includes(userId)) return res.status(400).json({ error: "Bu kupon kodu geçersiz ya da kullanılmış." });
    if (cartTotal < coupon.minimumSpend) return res.status(400).json({ error: `Minimum cart total of ${coupon.minimumSpend} required to use this coupon.` });

    const discountAmount = coupon.discountType === "percent" ? (cartTotal * (coupon.discountValue / 100)).toFixed(2) : coupon.discountValue.toFixed(2);
    coupon.usedBy.push(userId);
    await coupon.save();

    res.status(200).json({ discountAmount, discountType: coupon.discountType, cartTotal, discountedTotal: (cartTotal - discountAmount).toFixed(2) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Temporarily Use Coupon
router.post("/use/temporary/:couponCode", authMiddleware, csrfProtection, async (req, res) => {
  try {
    const couponCode = req.params.couponCode;
    const userId = req.user.id;

    await Coupon.updateMany({ temporaryUseBy: userId }, { $pull: { temporaryUseBy: userId } });
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) return res.status(404).json({ error: "Coupon not found." });

    if (coupon.temporaryUseBy.includes(userId)) return res.status(400).json({ error: "Coupon already temporarily used by this user." });

    coupon.temporaryUseBy.push(userId);
    await coupon.save();
    res.status(200).json({ message: "Coupon temporarily used successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Clear Temporary Use
router.post("/use/clear/:couponCode", authMiddleware, csrfProtection, async (req, res) => {
  try {
    const couponCode = req.params.couponCode;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) return res.status(404).json({ error: "Coupon not found." });

    coupon.temporaryUseBy = coupon.temporaryUseBy.filter(id => id.toString() !== userId);
    await coupon.save();
    res.status(200).json({ message: "Coupon temporary use cleared successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Get all coupons
router.get("/", authMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Get a coupon by ID
router.get("/:couponId", authMiddleware, async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(404).json({ error: "Coupon not found." });
    res.status(200).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Update a coupon
router.put("/:couponId", authMiddleware, csrfProtection, async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const updates = req.body;

    const existingCoupon = await Coupon.findById(couponId);
    if (!existingCoupon) return res.status(404).json({ error: "Coupon not found." });

    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updates, { new: true });
    res.status(200).json(updatedCoupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
