const Product = require("../models/Product");
const cloudinary = require("../config/db.js");
const streamifier = require("streamifier");

const addProduct = async (req, res) => {
  try {
    console.log("--- Upload Process Started ---");

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images provided" });
    }
    console.log(
      "DEBUG: Configured Cloud Name:",
      cloudinary.config().cloud_name,
    );
    console.log("DEBUG: Configured API Key:", cloudinary.config().api_key);
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Veloura_products" },
          (error, result) => {
            if (result) resolve(result.secure_url);
            else {
              console.error("Cloudinary Error Details:", error);
              reject(error);
            }
          },
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    const safeParse = (data) => {
      try {
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    };

    // 3. Create the Product with the new fields
    const newProduct = new Product({
      productId: req.body.productId, 
      name: req.body.name,
      price: Number(req.body.price),
      comparePrice: req.body.comparePrice
        ? Number(req.body.comparePrice)
        : undefined,
      stock: Number(req.body.stock),
      category: req.body.category,
      subcategory: req.body.subcategory,
      brand: req.body.brand,
      gender: req.body.gender,
      origin: req.body.origin,
      weight: Number(req.body.weight),
      status: req.body.status || "active",
      images: imageUrls,
      colors: safeParse(req.body.colors),
      sizes: safeParse(req.body.sizes),
      materials: safeParse(req.body.materials),
      tags: safeParse(req.body.tags),
      extraFields: safeParse(req.body.extraFields),
    });

    await newProduct.save();
    console.log(`Success: Product ${req.body.productId} saved.`);

    res.status(201).json({
      success: true,
      message: "Masterpiece Published!",
      product: newProduct,
    });
  } catch (error) {
    console.error("--- FINAL ERROR LOG ---");
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // Sort by newest first
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch products"
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not delete product"
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedData = {
      name: req.body.name,
      price: Number(req.body.price),
      comparePrice: req.body.comparePrice ? Number(req.body.comparePrice) : undefined,
      stock: Number(req.body.stock),
      category: req.body.category,
      subcategory: req.body.subcategory,
      brand: req.body.brand,
      gender: req.body.gender,
      sizes: req.body.sizes,
      colors: req.body.colors,
      materials: req.body.materials,
      tags: req.body.tags,
      images: req.body.images,
      status: req.body.status,
      origin: req.body.origin,
      weight: req.body.weight ? Number(req.body.weight) : undefined,
      extraFields: req.body.extraFields 
    };

    const product = await Product.findByIdAndUpdate(
      id, 
      { $set: updatedData }, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllProductStore = async (req, res) => {
    try {
        
        const products = await Product.find({ status: 'active' });

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching products from database",
            error: error.message
        });
    }
};
module.exports = { addProduct, getAllProducts, deleteProduct, getSingleProduct,updateProduct, getAllProductStore };
