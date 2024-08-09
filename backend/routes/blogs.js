const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const Blog = require("../models/Blog.js");

// Multer ayarları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Yeni Blog Oluşturma
router.post("/", async (req, res) => {
    try {
        const { name, title, img, desc, subdesc, blockquote, tags } = req.body;

        const newBlog = new Blog({ name, title, img, desc, subdesc, blockquote, tags });
        await newBlog.save();

        res.status(201).json(newBlog);
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ error: "Server error. Please check logs for details." });
    }
});

// Blogları Getirme
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ error: "Server error. Please check logs for details." });
    }
});

// Tekli Blog Getirme
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.status(200).json(blog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ error: "Server error. Please check logs for details." });
    }
});

// Rastgele Blogları Getirme
router.get("/random/:count", async (req, res) => {
    const count = parseInt(req.params.count, 10) || 3;
    try {
        const blogs = await Blog.aggregate([{ $sample: { size: count } }]);
        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching random blogs:", error);
        res.status(500).json({ error: "Server error. Please check logs for details." });
    }
});

// Resim Yükleme
router.post("/upload", upload.single('image'), (req, res) => {
    try {
        res.status(200).json({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: "Server error. Please check logs for details." });
    }
});

// Blog Güncelleme
router.put("/:id", async (req, res) => {
    try {
        const { name, title, img, desc, subdesc, blockquote, tags } = req.body;
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { name, title, img, desc, subdesc, blockquote, tags },
            { new: true }
        );
        if (!updatedBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.status(200).json(updatedBlog);
    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json({ error: "Server error. Please check logs for details." });
    }
});

router.delete("/:id", async (req, res) => {
    try {
      const blogId = req.params.id;
      const deletedBlog = await Blog.findByIdAndDelete(blogId);
      if (!deletedBlog) {
        return res.status(404).json({ error: "Blog not found" });
      }
      res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router;
