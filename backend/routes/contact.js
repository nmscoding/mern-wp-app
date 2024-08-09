const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Contact = require("../models/Contact.js");

// Yeni İletişim Oluşturma
router.post("/", async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;

    const newContact = new Contact({ name, email, message, subject });
    await newContact.save();

    res.status(201).json(newContact);
  } catch (error) {
    console.error("Error creating contact:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// İletişim Getirme
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();
    console.log("Fetched contacts:", contacts); // Log fetched data
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// Tek Bir İletişimi Getirme
router.get("/:contactId", async (req, res) => {
  try {
    const contactId = req.params.contactId;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      console.error("Invalid contact ID format:", contactId);
      return res.status(400).json({ error: "Invalid contact ID format" });
    }

    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    res
      .status(500)
      .json({ error: "Server error. Please check logs for details." });
  }
});

// İletişim Silme
router.delete("/:contactId", async (req, res) => {
  try {
    const contactId = req.params.contactId;
    console.log("Attempting to delete contact with ID:", contactId);

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      console.error("Invalid contact ID format:", contactId);
      return res.status(400).json({ error: "Invalid contact ID format" });
    }

    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      console.log("Contact not found for ID:", contactId);
      return res.status(404).json({ error: "Contact not found." });
    }

    console.log("Contact successfully deleted:", deletedContact);
    res.status(200).json(deletedContact);
  } catch (error) {
    console.error("Error deleting contact:", error);
    res
      .status(500)
      .json({ error: `Server error: ${error.message}`, details: error });
  }
});

module.exports = router;
