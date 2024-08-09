const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const addressSchema = new mongoose.Schema({
  addressname: { type: String },
  province: { type: String },
  town: { type: String },
  district: { type: String },
  neighbourhood: { type: String },
  addressdesc: { type: String },
});

const userSchema = new mongoose.Schema({
  googleId: { type: String },
  name: { type: String, required: true },
  surname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, default: "user" },
  phone: { type: String },
  address: [addressSchema],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  refreshToken: { type: String },
  resetToken: { type: String },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();const mongoose = require("mongoose");
  const bcrypt = require("bcrypt");
  
  const addressSchema = new mongoose.Schema({
    addressname: { type: String },
    province: { type: String },
    town: { type: String },
    district: { type: String },
    neighbourhood: { type: String },
    addressdesc: { type: String },
  });
  
  const userSchema = new mongoose.Schema({
    googleId: { type: String },
    name: { type: String, required: true },
    surname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: "user" },
    phone: { type: String },
    address: [addressSchema],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    refreshToken: { type: String },
    resetToken: { type: String },
  });
  
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
      this.password = await bcrypt.hash(this.password, 10);
      console.log("Password hashed in pre-save middleware:", this.password);
      next();
    } catch (err) {
      console.error("Error hashing password:", err);
      next(err);
    }
  });
  
  userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      console.log(
        `Comparing password: ${candidatePassword} with hash: ${this.password}, result: ${isMatch}`
      );
      return isMatch;
    } catch (err) {
      console.error("Error comparing password:", err);
      throw err;
    }
  };
  
  const User = mongoose.model("User", userSchema);
  
  module.exports = User;
  
  try {
    this.password = await bcrypt.hash(this.password, 10);
    console.log("Password hashed in pre-save middleware:", this.password);
    next();
  } catch (err) {
    console.error("Error hashing password:", err);
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(
      `Comparing password: ${candidatePassword} with hash: ${this.password}, result: ${isMatch}`
    );
    return isMatch;
  } catch (err) {
    console.error("Error comparing password:", err);
    throw err;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
