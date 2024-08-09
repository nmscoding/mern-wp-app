const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require('path');
const ProductCampaign = require("../models/ProductCampaign");

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Resim yükleme endpoint'i
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ message: "File upload failed.", error: error.message });
  }
});

// Yeni Kampanya Oluşturma Endpoint'i
router.post("/", async (req, res) => {
  try {
    const { img } = req.body;

    if (!img) {
      throw new Error("No image URL provided");
    }

    const newProductCampaign = new ProductCampaign({ img });
    await newProductCampaign.save();

    res.status(201).json(newProductCampaign);
  } catch (error) {
    console.error("Error creating campaign:", error.message);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Kampanya Getirme
router.get("/", async (req, res) => {
  try {
    const productcampaign = await ProductCampaign.find();
    res.status(200).json(productcampaign);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Tüm Kampanyaları Silme Endpoint'i
router.delete("/", async (req, res) => {
  try {
    await ProductCampaign.deleteMany({});
    res.status(200).json({ message: "Tüm kampanyalar silindi." });
  } catch (error) {
    console.error("Error deleting campaigns:", error);
    res.status(500).json({ error: `Server error: ${error.message}`, details: error });
  }
});

// Tek Bir Kampanyayı Getirme
router.get("/:productcampaignId", async (req, res) => {
  try {
    const productcampaignId = req.params.productcampaignId;

    if (!mongoose.Types.ObjectId.isValid(productcampaignId)) {
      console.error("Invalid campaign ID format:", productcampaignId);
      return res.status(400).json({ error: "Invalid campaign ID format" });
    }

    const productcampaign = await ProductCampaign.findById(productcampaignId);

    if (!productcampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.status(200).json(productcampaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Tek Bir Kampanyayı Silme
router.delete("/:productcampaignId", async (req, res) => {
  try {
    const productcampaignId = req.params.productcampaignId;

    if (!mongoose.Types.ObjectId.isValid(productcampaignId)) {
      console.error("Invalid campaign ID format:", productcampaignId);
      return res.status(400).json({ error: "Invalid campaign ID format" });
    }

    const deletedProductCampaign = await ProductCampaign.findByIdAndDelete(productcampaignId);

    if (!deletedProductCampaign) {
      return res.status(404).json({ error: "Campaign not found." });
    }

    res.status(200).json(deletedProductCampaign);
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ error: `Server error: ${error.message}`, details: error });
  }
});

module.exports = router;
