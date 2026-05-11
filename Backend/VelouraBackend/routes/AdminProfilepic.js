// routes/profileRoutes.js

const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const { protect } = require("../middleware/authmiddleware");
const { getProfile, uploadProfilePicture } = require("../controllers/profileController");


const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); 

router.get  ("/me",      protect, getProfile);
router.patch("/picture", protect, upload.single("avatar"), uploadProfilePicture);

module.exports = router;