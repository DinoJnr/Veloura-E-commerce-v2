const { Admin, Logistics } = require("../models/AdminReg");
const cloudinary = require("cloudinary").v2; 
exports.getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const Model = role === "admin" ? Admin : Logistics;
    const user  = await Model.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ profile: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.uploadProfilePicture = async (req, res) => {
  try {
    const { id, role } = req.user;
    if (!req.file) return res.status(400).json({ message: "No image file provided." });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "veloura/profiles", transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }] },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    const Model = role === "admin" ? Admin : Logistics;
    const user  = await Model.findByIdAndUpdate(
      id,
      { profilePicture: result.secure_url },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Profile picture updated.", profile: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};