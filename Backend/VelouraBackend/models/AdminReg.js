// models/Admin.js

const mongoose = require("mongoose");

const baseSchema = {
  fullName:       { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  systemId:       { type: String, required: true, unique: true },
  profilePicture: { type: String, default: "" }, // ← Cloudinary URL
  createdAt:      { type: Date, default: Date.now },
};

const AdminSchema = new mongoose.Schema({
  ...baseSchema,
  role: { type: String, default: "admin" },
});

const LogisticsSchema = new mongoose.Schema({
  ...baseSchema,
  role:     { type: String, default: "logistics" },
  isActive: { type: Boolean, default: true }, // ← toggle login access
});

const Admin     = mongoose.model("Admin",     AdminSchema);
const Logistics = mongoose.model("Logistics", LogisticsSchema);

module.exports = { Admin, Logistics };