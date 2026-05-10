

const bcrypt        = require("bcryptjs");
const { Admin, Logistics } = require("../models/AdminReg");


exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found." });
    res.status(200).json({ admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateAdmin = async (req, res) => {
  try {
    const { fullName, email, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    if (fullName) admin.fullName = fullName;
    if (email)    admin.email    = email;

    // Password change — verify current first
    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: "Current password is required." });
      const match = await bcrypt.compare(currentPassword, admin.password);
      if (!match)
        return res.status(401).json({ message: "Current password is incorrect." });
      admin.password = await bcrypt.hash(newPassword, 12);
    }

    await admin.save();
    res.status(200).json({ message: "Admin account updated.", admin: { fullName: admin.fullName, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const fs   = require("fs");
const path = require("path");
const STORE_FILE = path.join(__dirname, "../data/storeInfo.json");

const readStore  = () => fs.existsSync(STORE_FILE) ? JSON.parse(fs.readFileSync(STORE_FILE)) : {};
const writeStore = (data) => {
  fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
};

exports.getStoreInfo = (req, res) => {
  res.status(200).json({ store: readStore() });
};


exports.updateStoreInfo = (req, res) => {
  try {
    const current = readStore();
    const updated = { ...current, ...req.body };
    writeStore(updated);
    res.status(200).json({ message: "Store info updated.", store: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.getAllLogistics = async (req, res) => {
  try {
    const logistics = await Logistics.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ logistics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.toggleLogisticsActive = async (req, res) => {
  try {
    const user = await Logistics.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Logistics user not found." });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `Account ${user.isActive ? "activated" : "deactivated"}.`,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteLogistics = async (req, res) => {
  try {
    const user = await Logistics.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Logistics user not found." });
    res.status(200).json({ message: "Logistics account deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};