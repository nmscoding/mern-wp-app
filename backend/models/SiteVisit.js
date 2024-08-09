const mongoose = require("mongoose");

const SiteVisitSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    ipAddress: { type: String, required: false }, 
    userAgent: { type: String, required: false }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, 
    visitDuration: { type: Number, required: false }, 
    pageUrl: { type: String, required: false }, 
    referrerUrl: { type: String, required: false }, 
  },
  { timestamps: true }
);

const SiteVisit = mongoose.model("SiteVisit", SiteVisitSchema);

module.exports = SiteVisit;
