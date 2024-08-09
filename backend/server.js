const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config();
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const csrf = require("csurf");
const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const usersRouter = require("./routes/users");
const couponsRouter = require("./routes/coupons");
const authRouter = require("./routes/auth");
const blogRouter = require("./routes/blogs");
const brandRouter = require("./routes/brand");
const contactRouter = require("./routes/contact");
const campaignRouter = require("./routes/campaign");
const sliderRouter = require("./routes/slider");
const productcampaignRouter = require("./routes/productcampaign");
const ordersRouter = require("./routes/orders");
const siteVisitsRouter = require("./routes/sitevisit");
const port = 5000;

dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected!");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected!");
});

const app = express();

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Oturum yönetimi için express-session middleware'ini ekleyin
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", 
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
      sameSite: "strict",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session()); 

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.get("/csrf-token", (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ csrfToken });
});

app.get("/refresh-csrf-token", csrfProtection, (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ csrfToken });
});

app.use("/api/urun", productsRouter);
app.use("/api/kategori", categoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/hesap", authRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/brands", brandRouter);
app.use("/api/contact", contactRouter);
app.use("/api/campaigns", campaignRouter);
app.use("/api/sliders", sliderRouter);
app.use("/api/productcampaign", productcampaignRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/site-visits", siteVisitsRouter);
app.use("/auth", authRouter);

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res
    .status(500)
    .json({ message: "An unexpected error occurred", error: err.message });
});

app.listen(port, () => {
  connect();
  console.log(`Server is running on port ${port}`);
});
