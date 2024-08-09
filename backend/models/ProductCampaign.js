const mongoose = require("mongoose");

const ProductCampaignSchema = mongoose.Schema(
  {
    img: { type: String, required: true },
  },
  { timestamps: true }
);

const ProductCampaign = mongoose.model("ProductCampaign", ProductCampaignSchema);

module.exports = ProductCampaign;