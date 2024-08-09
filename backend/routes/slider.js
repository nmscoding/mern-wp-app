const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const Slider = require("../models/Slider");

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

// Yeni Slider Oluşturma
router.post("/", async (req, res) => {
  try {
    const { title, subtitle, img, productId } = req.body;
    if (!img) {
      throw new Error("No image URL provided");
    }

    console.log("Creating new slider with title:", title, "and image URL:", img);

    const newSlider = new Slider({ title, subtitle, img, productId });
    await newSlider.save();

    res.status(201).json(newSlider);
  } catch (error) {
    console.error("Error creating slider:", error.message);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Slider'ları Getirme
router.get("/", async (req, res) => {
  try {
    const sliders = await Slider.find().populate('productId'); // productId alanını doldur
    res.status(200).json(sliders);
  } catch (error) {
    console.error("Error fetching sliders:", error);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Tek Bir Slider'ı Getirme
router.get("/:sliderId", async (req, res) => {
  try {
    const sliderId = req.params.sliderId;

    if (!mongoose.Types.ObjectId.isValid(sliderId)) {
      console.error("Invalid slider ID format:", sliderId);
      return res.status(400).json({ error: "Invalid slider ID format" });
    }

    const slider = await Slider.findById(sliderId).populate('productId'); // productId alanını doldur

    if (!slider) {
      return res.status(404).json({ error: "Slider not found" });
    }

    res.status(200).json(slider);
  } catch (error) {
    console.error("Error fetching slider:", error);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Slider Güncelleme
router.put("/:sliderId", upload.single("img"), async (req, res) => {
  try {
    const sliderId = req.params.sliderId;
    const updates = req.body;

    if (req.file) {
      updates.img = req.file.path; // Yeni yüklenen dosyanın yolu
    }

    if (!mongoose.Types.ObjectId.isValid(sliderId)) {
      console.error("Invalid slider ID format:", sliderId);
      return res.status(400).json({ error: "Invalid slider ID format" });
    }

    const existingSlider = await Slider.findById(sliderId);

    if (!existingSlider) {
      return res.status(404).json({ error: "Slider not found" });
    }

    const updatedSlider = await Slider.findByIdAndUpdate(sliderId, updates, { new: true }).populate('productId'); // productId alanını doldur
    res.status(200).json(updatedSlider);
  } catch (error) {
    console.error("Error updating slider:", error);
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Slider Silme
router.delete("/:sliderId", async (req, res) => {
  try {
    const sliderId = req.params.sliderId;

    if (!mongoose.Types.ObjectId.isValid(sliderId)) {
      console.error("Invalid slider ID format:", sliderId);
      return res.status(400).json({ error: "Invalid slider ID format" });
    }

    const deletedSlider = await Slider.findByIdAndDelete(sliderId);

    if (!deletedSlider) {
      return res.status(404).json({ error: "Slider not found." });
    }

    res.status(200).json(deletedSlider);
  } catch (error) {
    console.error("Error deleting slider:", error);
    res.status(500).json({ error: `Server error: ${error.message}`, details: error });
  }
});

module.exports = router;
