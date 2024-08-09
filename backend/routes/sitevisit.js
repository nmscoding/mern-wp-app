const express = require("express");
const router = express.Router();
const SiteVisit = require("../models/SiteVisit");

// Son 30 günün site ziyaret verilerini getiren uç nokta
router.get("/total-site-visits", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    const visits = await SiteVisit.find({ date: { $gte: past30Days } });

    const totalSiteVisits = visits.length;

    res.json({ totalSiteVisits });
  } catch (error) {
    console.error("Error fetching site visits:", error);
    res
      .status(500)
      .json({ message: "Error fetching site visits", error: error.message });
  }
});

// Yeni bir site ziyaret kaydı eklemek için uç nokta
router.post("/add-visit", async (req, res) => {
  try {
    const {
      ipAddress,
      userAgent,
      userId,
      visitDuration,
      pageUrl,
      referrerUrl,
    } = req.body;

    const newVisit = new SiteVisit({
      date: new Date(),
      ipAddress,
      userAgent,
      userId,
      visitDuration,
      pageUrl,
      referrerUrl,
    });

    await newVisit.save();
    res.status(201).json({ message: "Visit recorded successfully." });
  } catch (error) {
    console.error("Error recording visit:", error);
    res
      .status(500)
      .json({ message: "Error recording visit", error: error.message });
  }
});

module.exports = router;
