// routes/settingsRoutes.js

const express = require("express");
const router  = express.Router();
const {
  getAdmin,
  updateAdmin,
  getStoreInfo,
  updateStoreInfo,
  getAllLogistics,
  toggleLogisticsActive,
  deleteLogistics,
} = require("../controllers/AdminsettingsController");

const { protect, adminOnly } = require("../middleware/authMiddleware.js");


router.use(protect, adminOnly);

// Admin account
router.get   ("/admin/:id",            getAdmin);
router.patch ("/admin/:id",            updateAdmin);

// Store info
router.get   ("/store",                getStoreInfo);
router.patch ("/store",                updateStoreInfo);

// Logistics admins
router.get   ("/logistics",            getAllLogistics);
router.patch ("/logistics/:id/toggle", toggleLogisticsActive);
router.delete("/logistics/:id",        deleteLogistics);

module.exports = router;