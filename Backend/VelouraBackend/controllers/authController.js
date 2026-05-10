const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { Admin, Logistics } = require("../models/AdminReg");

const JWT_SECRET  = process.env.JWT_SECRET || "veloura_secret_change_in_prod";
const JWT_EXPIRES = "7d";

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  try {
    // Search both collections — role comes from the DB document itself
    let user = await Admin.findOne({ email });
    if (!user) user = await Logistics.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid email or password." });
    console.log("USER FOUND:", user.email, "| role:", user.role, "| isActive:", user.isActive);

    // Read role directly from the DB document — never derive from lookup order
    const role = user.role;

    // Block inactive logistics accounts
    if (role === "logistics" && user.isActive === false)
      return res.status(403).json({ message: "Your account has been deactivated. Contact the administrator." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password." });

    const token = jwt.sign(
      { id: user._id, role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id:       user._id,
        fullName: user.fullName,
        email:    user.email,
        systemId: user.systemId,
        role,
      },
    });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
};