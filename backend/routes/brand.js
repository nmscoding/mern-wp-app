const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const Brand = require("../models/Brand");

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
    res.status(200).json({ url: imagePath });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Yeni Marka Oluşturma
router.post("/", async (req, res) => {
  try {
    const { name, img } = req.body;
    if (!img) {
      throw new Error("No image URL provided");
    }

    console.log("Creating new brand with name:", name, "and image URL:", img);

    const newBrand = new Brand({ name, img });
    await newBrand.save();

    res.status(201).json(newBrand);
  } catch (error) {
    console.error("Error creating brand:", error.message);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Markaları Getirme
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Tek Bir Markayı Getirme
router.get("/:brandId", async (req, res) => {
  try {
    const brandId = req.params.brandId;

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      console.error("Invalid brand ID format:", brandId);
      return res.status(400).json({ error: "Invalid brand ID format" });
    }

    const brand = await Brand.findById(brandId);

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.status(200).json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Marka Güncelleme
router.put("/:brandId", upload.single("img"), async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const updates = req.body;

    if (req.file) {
      updates.img = req.file.path; // Yeni yüklenen dosyanın yolu
    }

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      console.error("Invalid brand ID format:", brandId);
      return res.status(400).json({ error: "Invalid brand ID format" });
    }

    const existingBrand = await Brand.findById(brandId);

    if (!existingBrand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const updatedBrand = await Brand.findByIdAndUpdate(brandId, updates, { new: true });
    res.status(200).json(updatedBrand);
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Marka Silme
router.delete("/:brandId", async (req, res) => {
  try {
    const brandId = req.params.brandId;

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      console.error("Invalid brand ID format:", brandId);
      return res.status(400).json({ error: "Invalid brand ID format" });
    }

    const deletedBrand = await Brand.findByIdAndDelete(brandId);

    if (!deletedBrand) {
      return res.status(404).json({ error: "Brand not found." });
    }

    res.status(200).json(deletedBrand);
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({ error: `Server error: ${error.message}`, details: error });
  }
});

module.exports = router;
