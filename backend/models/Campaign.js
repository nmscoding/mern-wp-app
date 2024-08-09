const mongoose = require("mongoose");

const CampaignSchema = mongoose.Schema(
  {
    img: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true},
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", CampaignSchema);

module.exports = Campaign;