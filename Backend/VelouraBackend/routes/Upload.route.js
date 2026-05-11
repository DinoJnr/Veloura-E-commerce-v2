const express = require("express");
const router  = express.Router();
const upload  = require("../middleware/upload.js");
const {
  addProduct,
  getAllProducts,
  deleteProduct,
  getSingleProduct,
  updateProduct,
  getAllProductStore,
} = require("../controllers/Product.controller");
const { protect, adminOnly } = require("../middleware/authmiddleware.js");


router.get("/getallproducts", getAllProductStore);


router.post  ("/addproduct",          protect, adminOnly, upload.array("images", 4), addProduct);
router.get   ("/getproducts",         protect, getAllProducts);
router.delete("/deleteproduct/:id",   protect, adminOnly, deleteProduct);
router.get   ("/getproduct/:id",      protect, getSingleProduct);
router.put   ("/updateproduct/:id",   protect, adminOnly, updateProduct);

module.exports = router;