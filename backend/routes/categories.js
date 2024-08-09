const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Category = require("../models/Category.js");
const csrf = require("csurf");

const csrfProtection = csrf({ cookie: true });

// Yeni Kategori Oluşturma
router.post("/", csrfProtection, async (req, res) => {
  try {
    const { name, img } = req.body;

    const newCategory = new Category({ name, img });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error); 
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Kategorileri Getirme
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error); 
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Tek Bir Kategoriyi Getirme
router.get("/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      console.error("Invalid category ID format:", categoryId); 
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error); 
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Kategori Güncelleme
router.put("/:categoryId", csrfProtection, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      console.error("Invalid category ID format:", categoryId); 
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const existingCategory = await Category.findById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error); 
    res.status(500).json({ error: "Server error. Please check logs for details." });
  }
});

// Kategori Silme
router.delete("/:categoryId", csrfProtection, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    console.log("Attempting to delete category with ID:", categoryId); 

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      console.error("Invalid category ID format:", categoryId); 
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      console.log("Category not found for ID:", categoryId); 
      return res.status(404).json({ error: "Category not found." });
    }

    console.log("Category successfully deleted:", deletedCategory); 
    res.status(200).json(deletedCategory);
  } catch (error) {
    console.error("Error deleting category:", error); 
    res.status(500).json({ error: `Server error: ${error.message}`, details: error });
  }
});

module.exports = router;
