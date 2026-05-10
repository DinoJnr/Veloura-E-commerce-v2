

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "veloura_secret_change_in_prod";

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided. Access denied." });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admin access required." });
  next();
};

module.exports = { protect, adminOnly };