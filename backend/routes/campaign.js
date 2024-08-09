const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const Campaign = require("../models/Campaign");

// Multer konfigürasyonu (Dosya yükleme)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Resim Yükleme Endpoint'i
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const imagePath = req.file.path; // Yüklenen dosyanın yolu
    res.status(200).json({ url: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error("Error uploading image:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Yeni Kampanya Oluşturma Endpoint'i
router.post("/", async (req, res) => {
  try {
    const { title, desc, img } = req.body;

    if (!img) {
      throw new Error("No image URL provided");
    }

    const newCampaign = new Campaign({ title, desc, img });
    await newCampaign.save();

    res.status(201).json(newCampaign);
  } catch (error) {
    console.error("Error creating campaign:", error.message);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Kampanyaları Getirme
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Tek Bir Kampanyayı Getirme
router.get("/:campaignId", async (req, res) => {
  try {
    const campaignId = req.params.campaignId;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      console.error("Invalid campaign ID format:", campaignId);
      return res.status(400).json({ error: "Invalid campaign ID format" });
    }

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Kampanya Güncelleme
router.put("/:campaignId", upload.single("img"), async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const updates = req.body;

    if (req.file) {
      updates.img = req.file.path; // Yeni yüklenen dosyanın yolu
    }

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      console.error("Invalid campaign ID format:", campaignId);
      return res.status(400).json({ error: "Invalid campaign ID format" });
    }

    const existingCampaign = await Campaign.findById(campaignId);

    if (!existingCampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      campaignId,
      updates,
      { new: true }
    );
    res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Kampanya Silme
router.delete("/:campaignId", async (req, res) => {
  try {
    const campaignId = req.params.campaignId;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      console.error("Invalid campaign ID format:", campaignId);
      return res.status(400).json({ error: "Invalid campaign ID format" });
    }

    const deletedCampaign = await Campaign.findByIdAndDelete(campaignId);

    if (!deletedCampaign) {
      return res.status(404).json({ error: "Campaign not found." });
    }

    res.status(200).json(deletedCampaign);
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res
      .status(500)
      .json({ error: `Server error: ${error.message}`, details: error });
  }
});

module.exports = router;
