const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const csrf = require("csurf");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.use(
  cors({
    origin: "http://waterplanet.store",
    credentials: true,
  })
);
router.use(helmet());
router.use(csrfProtection);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://waterplanet.store/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
          } else {
            user = new User({
              googleId: profile.id,
              name: profile.name.givenName,
              surname: profile.name.familyName,
              email: profile.emails[0].value,
            });
          }
          await user.save();
        }

        // Google Contacts API ile ek bilgileri alın
        const contactResponse = await axios.get(
          "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,phoneNumbers",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const contactData = contactResponse.data;

        if (contactData) {
          user.phone = contactData.phoneNumbers
            ? contactData.phoneNumbers[0].value
            : user.phone;
          // Diğer bilgileri buraya ekleyin
          await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/contacts.readonly",
    ],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL || "http://waterplanet.store",
  }),
  (req, res) => {
    const { token } = req.user;
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.redirect(
      `${
        process.env.FRONTEND_URL
      }/auth/success?token=${token}&user=${encodeURIComponent(
        JSON.stringify(req.user.user)
      )}`
    );
  }
);

// Authenticate Token Middleware
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

    const now = Math.floor(Date.now() / 1000);
    const expirationTime = user.exp;
    const timeLeft = expirationTime - now;

    if (timeLeft < 600) {
      // less than 10 minutes
      const newToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    next();
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

// Token refresh route
router.post("/token", async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const newToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(403).json({ error: "Forbidden", details: error.message });
  }
});

// Forgot Password Route
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please enter a valid email")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      user.resetToken = resetToken;
      await user.save();

      // E-posta gönderimi
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Şifre Sıfırlama",
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Şifre Sıfırlama Talebi</h2>
            <img src="https://r.resimlink.com/UuBHqV8.png" title="ResimLink - Resim Yükle" alt="ResimLink - Resim Yükle" style="width: 100%; max-width: 100px; height: auto; margin-top: 20px;">
            <p>Water Planet Filter Technology</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayınız:</p>
            <p>${process.env.FRONTEND_URL}/reset-password?token=${resetToken}</p>
            <p>Bu bağlantı 1 saat geçerlidir. Eğer bu talebi siz yapmadıysanız, lütfen bu mesajı dikkate almayın.</p>
          </div>
        `,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error); // Hata detayını günlüğe ekleyin
          return res.status(500).json({ error: "Error sending email" });
        }
        res
          .status(200)
          .json({ message: "Şifre sıfırlama e-postası gönderildi" });
      });
    } catch (error) {
      console.error("Error during forgot password:", error); // Hata detayını günlüğe ekleyin
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
);

// Reset Password Route
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Şifre 6 karakterden uzun olmalıdır!"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.resetToken !== token) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Şifreyi hashle ve kaydet
      user.password = newPassword;
      user.resetToken = null;
      await user.save();

      console.log("Password reset successful for user:", user);

      res.status(200).json({ message: "Şifre başarıyla sıfırlandı" });
    } catch (error) {
      console.error("Error during password reset:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
);

/// Registration Route
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("surname").notEmpty().withMessage("Surname is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, surname, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Şifre hashleme işlemini model middleware'inde yapıyoruz
      user = new User({
        name,
        surname,
        email,
        password, // Şifre burada düz metin olarak saklanacak, model middleware'inde hashleniyor
      });

      await user.save();

      console.log("User saved:", user);

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(201).json({ message: "Kayıt Başarılı!", user, token });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: `Server error: ${error.message}` });
    }
  }
);

// Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found");
        return res.status(401).json({ error: "E-posta ya da şifre hatalı!" });
      }

      const isPasswordValid = await user.comparePassword(password);
      console.log(
        `Comparing password: ${password} with hash: ${user.password}, result: ${isPasswordValid}`
      );

      if (!isPasswordValid) {
        console.log("Invalid password");
        return res.status(401).json({ error: "E-posta ya da şifre hatalı!" });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({ message: "Giriş Başarılı", user, token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: `Server error: ${error.message}` });
    }
  }
);

// Get User Profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ error: `Server error: ${error.message}`, details: error });
  }
});

// Update User Profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("surname").notEmpty().withMessage("Surname is required"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, surname, phone, address } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.name = name;
      user.surname = surname;
      user.phone = phone;
      user.address = address;

      await user.save();

      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
);

// Update Password Route
router.post("/update-password", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10); // Hash the new password
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ error: `Server error: ${error.message}`, details: error });
  }
});

// Add User Address
router.post("/address", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { address } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.address.push(address);
    await user.save();

    res.status(201).json(user.address);
  } catch (error) {
    console.error("Error adding address:", error);
    res
      .status(500)
      .json({ error: `Server error: ${error.message}`, details: error });
  }
});

// Get User Address
router.get("/address", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      phone: user.phone,
      address: user.address,
      surname: user.surname || {},
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Server error: ${error.message}`, details: error });
  }
});

// Delete User Address
router.delete("/address/:addressId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.address = user.address.filter(
      (addr) => addr._id.toString() !== addressId
    );
    await user.save();

    res
      .status(200)
      .json({ message: "Adres başarıyla silindi", address: user.address });
  } catch (error) {
    console.error("Error deleting address:", error);
    res
      .status(500)
      .json({ error: `Server error: ${error.message}`, details: error });
  }
});

// Favori Ürün Ekleme
router.post("/favorites", authenticateToken, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({
      message: "Favori eklenirken hata oluştu",
      error: error.message,
    });
  }
});

// Favori Ürün Çıkarma
router.delete("/favorites/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== productId
    );
    await user.save();

    await user.populate("favorites");
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({
      message: "Favori çıkarılırken hata oluştu",
      error: error.message,
    });
  }
});

// Favori Ürünleri Getirme
router.get("/favorites", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("favorites");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const favoriteProducts = user.favorites.filter(
      (favorite) => typeof favorite === "object"
    );
    res.status(200).json(favoriteProducts);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({
      message: "Favoriler getirilirken hata oluştu",
      error: error.message,
    });
  }
});

// Kullanıcı rolü
router.get("/role", authenticateToken, async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ role: user.role });
  } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).json({ error: "Server error", details: error.message });
  }
});


module.exports = router;
