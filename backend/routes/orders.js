const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const jwt = require("jsonwebtoken");
const csrf = require("csurf");

const csrfProtection = csrf({ cookie: true });

const generateOrderNumber = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

// Kullanıcı doğrulaması için middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

router.post("/", authMiddleware, csrfProtection, async (req, res) => {
  try {
    const { buyer, items, couponCode } = req.body;

    if (!buyer || !buyer.email) {
      return res.status(400).json({ message: "Alıcı bilgileri eksik." });
    }

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let total = subtotal;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });

      if (!coupon) {
        return res.status(404).json({ error: "Kupon bulunamadı." });
      }

      if (new Date() > new Date(coupon.expiryDate)) {
        return res.status(400).json({ error: "Kupon süresi dolmuş." });
      }

      if (coupon.discountType === "percent") {
        total = subtotal * (1 - coupon.discountValue / 100);
      } else if (coupon.discountType === "amount") {
        total = subtotal - coupon.discountValue;
      }
    }

    const orderNumber = generateOrderNumber();

    const newOrder = new Order({
      buyer: {
        ...buyer,
        userId: req.user.id,
      },
      items,
      subtotal,
      total,
      orderNumber,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("items.product");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/user-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ "buyer.userId": userId }).populate(
      "items.product"
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: error.message });
  }
});

// 30 günlük satış verilerini getiren uç nokta
router.get("/sales-data", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    const orders = await Order.find({ createdAt: { $gte: past30Days } });

    const salesData = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!salesData[date]) {
        salesData[date] = 0;
      }
      salesData[date] += order.total;
    });

    const formattedSalesData = Object.keys(salesData).map((date) => ({
      date,
      sales: salesData[date],
    }));

    res.json(formattedSalesData);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res
      .status(500)
      .json({ message: "Error fetching sales data", error: error.message });
  }
});

router.get("/total-products-sold", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    const orders = await Order.find({ createdAt: { $gte: past30Days } });
    const totalProductsSold = orders.reduce((total, order) => {
      return total + order.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    res.json({ totalProductsSold });
  } catch (error) {
    console.error("Error fetching total products sold:", error);
    res.status(500).json({
      message: "Error fetching total products sold",
      error: error.message,
    });
  }
});

router.put(
  "/:orderId/status",
  authMiddleware,
  csrfProtection,
  async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found." });
      }

      order.status = status;
      await order.save();
      res.status(200).json({ message: "Order status updated.", order });
    } catch (error) {
      console.error("Error updating order status:", error);
      res
        .status(500)
        .json({
          message: "Failed to update order status.",
          error: error.message,
        });
    }
  }
);

router.get("/total-wages-earned", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    const orders = await Order.find({ createdAt: { $gte: past30Days } });
    const totalWagesEarned = orders.reduce(
      (total, order) => total + order.total,
      0
    );

    res.json({ totalWagesEarned });
  } catch (error) {
    console.error("Error fetching total wages earned:", error);
    res.status(500).json({
      message: "Error fetching total wages earned",
      error: error.message,
    });
  }
});

module.exports = router;
