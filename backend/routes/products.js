const express = require("express");
const mongoose = require("mongoose");
const csrf = require("csurf");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const Category = require("../models/Category");
const router = express.Router();

const csrfProtection = csrf({ cookie: true });

// Genel middleware'leri uygulama seviyesinde kullanmak daha iyidir.
const app = express();
app.use(cors({ origin: "http://waterplanet.store", credentials: true }));
app.use(helmet());
app.use(cookieParser());
app.use(csrfProtection);

// CSRF Token Endpoint'i
app.get("/csrf-token", (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ csrfToken });
});

// Eksik `authenticateToken` fonksiyonunu tanımla
const authenticateToken = (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

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

const upload = multer({ storage });

// En çok görüntülenen ürünleri getirme
router.get("/top-views", async (req, res) => {
  try {
    console.log("Request received at /top-views");
    const topViewedProducts = await Product.find()
      .sort({ views: -1 })
      .limit(10);
    console.log("Top viewed products:", topViewedProducts);
    res.status(200).json(topViewedProducts);
  } catch (error) {
    console.error("Error fetching top viewed products:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Resim yükleme endpoint'i
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log("Uploaded image URL:", imageUrl);
    res.json({ url: imageUrl });
  } catch (error) {
    console.error("File upload error:", error);
    res
      .status(500)
      .json({ message: "File upload failed.", error: error.message });
  }
});

// Yeni Ürün Oluşturma
router.post("/", async (req, res) => {
  try {
    const { name, title, img, reviews, features, price, category } = req.body;

    if (
      !name ||
      !title ||
      !img ||
      img.length === 0 ||
      !price ||
      !price.newprice ||
      !category
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    // Features array olduğundan emin olun
    if (!Array.isArray(features)) {
      return res.status(400).json({ message: "Ürün özelliği girilmedi." });
    }

    const newProduct = new Product({
      ...req.body,
      views: 0, // Başlangıçta views alanı 0 olarak ayarlanır
    });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Product creation error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Tüm ürünleri getirme veya filtreleme
router.get("/", async (req, res) => {
  try {
    const { category, discountMin, limit, skip, sort } = req.query;
    let query = {};

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    if (discountMin) {
      query["price.discount"] = { $gt: parseInt(discountMin) };
    }

    let products = Product.find(query);

    let sortOption = {};
    switch (sort) {
      case "rising":
        sortOption = { "price": 1 };
        break;
      case "decreasing":
        sortOption = { "price": -1 };
        break;
      case "new":
        sortOption = { createdAt: -1 };
        break;
      case "old":
        sortOption = { createdAt: 1 };
        break;
      case "discount":
        sortOption = { "price.discount": -1 };
        break;
      default:
        sortOption = { createdAt: -1 }; 
        break;
    }

    products = products.sort(sortOption);

    if (skip) {
      products = products.skip(parseInt(skip));
    }

    if (limit) {
      products = products.limit(parseInt(limit));
    }

    products = await products;
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});


//Search İşlemleri

router.get("/search", async (req, res) => {
  try {
    const query = req.query.query;
    console.log("Received query:", query);

    if (!query || query.trim() === "") {
      console.log("Query parameter is missing or empty");
      return res
        .status(400)
        .json({ message: "Query parameter is required and cannot be empty" });
    }

    // Arama sorgusu için koşulları belirleme
    const searchConditions = [
      { name: { $regex: query, $options: "i" } },
      { title: { $regex: query, $options: "i" } },
    ];

    console.log("Search conditions before category check:", searchConditions);

    // Kategoriyi isme göre bulup ID'sini alıyoruz
    try {
      const category = await Category.findOne({
        name: { $regex: query, $options: "i" },
      });
      if (category) {
        searchConditions.push({ category: category._id });
        console.log("Category found and added to search conditions:", category);
      } else {
        console.log("No category found for query");
      }
    } catch (categoryError) {
      console.error("Error finding category:", categoryError);
    }

    console.log("Final search conditions:", searchConditions);

    try {
      const products = await Product.find({
        $or: searchConditions,
      })
        .populate("category")
        .populate("reviews.user");

      console.log("Found products:", products);
      res.status(200).json(products);
    } catch (productError) {
      console.error("Error finding products:", productError);
      return res
        .status(500)
        .json({
          error: `Server error: ${productError.message}`,
          details: productError,
        });
    }
  } catch (error) {
    console.error("Error searching product:", error);
    res
      .status(500)
      .json({ error: `Server error: ${error.message}`, details: error });
  }
});

// Belirli bir ürünü getirme ve görüntülenme sayısını arttırma
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log("Received productId:", productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("Invalid product ID format:", productId);
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } }, // Görüntülenme sayısını artır
      { new: true }
    );

    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("Found product:", product);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Ürün Güncelleme
router.put("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log("Updating product with ID:", productId);
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error("Invalid product ID format:", productId);
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const existingProduct = await Product.findById(productId);
    console.log("Existing product before update:", existingProduct);

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
    });
    console.log("Updated product:", updatedProduct);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Ürün Silme
router.delete("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log("Attempting to delete product with ID:", productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error("Invalid product ID format:", productId);
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      console.log("Product not found for ID:", productId);
      return res.status(404).json({ error: "Product not found." });
    }

    console.log("Product successfully deleted:", deletedProduct);
    res.status(200).json(deletedProduct);
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ error: `Server error: ${error.message}`, details: error });
  }
});

// Endpoint to get and update product views
router.get("/:productId/views", async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Increment the views count
    product.views += 1;
    await product.save();

    res.json({ views: product.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yorum İşlemleri

// Tüm yorumları almak
router.get("/reviews/all", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({}, "reviews").populate("reviews.user");

    const allReviews = products.flatMap((product) => product.reviews);

    res.status(200).json(allReviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Yeni Review Oluşturma
router.post(
  "/:productId/reviews",
  upload.array("images", 8),
  async (req, res) => {
    try {
      const productId = req.params.productId;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid product ID format" });
      }

      const { text, rating, user } = req.body;
      const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

      const newReview = {
        text,
        rating,
        user,
        images: imageUrls,
        product: productId, // Ürün ID'sini ekliyoruz
      };

      const product = await Product.findByIdAndUpdate(
        productId,
        { $push: { reviews: newReview } },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating review:", error);
      res
        .status(500)
        .json({ error: `Server error: ${error.message}`, details: error });
    }
  }
);

// Belirli bir ürünün yorumlarını almak
router.get("/:productId/reviews", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const product = await Product.findById(productId).populate("reviews.user");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product.reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Review Güncelleme
router.put(
  "/:productId/reviews/:reviewId",
  upload.array("images", 8),
  async (req, res) => {
    try {
      const { productId, reviewId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(reviewId)
      ) {
        return res
          .status(400)
          .json({ error: "Invalid product or review ID format" });
      }

      const { text, rating } = req.body;
      const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

      const product = await Product.findOneAndUpdate(
        { _id: productId, "reviews._id": reviewId },
        {
          $set: {
            "reviews.$.text": text,
            "reviews.$.rating": rating,
            "reviews.$.images": imageUrls,
          },
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ error: "Product or review not found" });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error("Error updating review:", error);
      res
        .status(500)
        .json({ error: `Server error: ${error.message}`, details: error });
    }
  }
);

//Review Silme İşlemi (Ürün ve Kullanıcı ID'sini kontrol etmeden)
router.delete(
  "/:productId/reviews/:reviewId",
  authenticateToken,
  async (req, res) => {
    try {
      const { productId, reviewId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(reviewId)
      ) {
        return res
          .status(400)
          .json({ error: "Geçersiz ürün veya inceleme ID formatı" });
      }

      const product = await Product.findOneAndUpdate(
        { _id: productId, "reviews._id": reviewId },
        { $pull: { reviews: { _id: reviewId } } },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ error: "Ürün veya inceleme bulunamadı" });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error("İnceleme silinirken hata oluştu:", error);
      res
        .status(500)
        .json({ error: `Sunucu hatası: ${error.message}`, details: error });
    }
  }
);


module.exports = router;
