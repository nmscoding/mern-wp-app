const express = require("express");
const router = express.Router();

// Other Route Files

const productRoute = require("./products.js");
const categoryRoute = require("./categories.js");
const authRoute = require("./auth.js");
const couponRoute = require("./coupons.js");
const userRoute = require("./users.js");
const blogRoute = require("./blogs.js")
const brandRoute = require("./brand.js")
const contactRoute = require("./contact.js")
const campaignRoute = require("./campaign.js")
const sliderRoute = require("./slider.js")

// All Route Using

router.use("/urun", productRoute);
router.use("/kategori", categoryRoute);
router.use("/users", userRoute);
router.use("/coupons", couponRoute);
router.use("/hesap", authRoute);
router.use("/blogs", blogRoute);
router.use("/brands", brandRoute);
router.use("/contact", contactRoute);
router.use("/campaigns", campaignRoute);
router.use("/sliders", sliderRoute);

module.exports = router;
