const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  subcategory: { type: String },
  brand: { type: String },
  gender: { type: String },
  sizes: [String],   
  colors: [String],  
  materials: [String],
  tags: [String],
  images: [String],  
  status: { type: String, default: 'active' },
  origin: { type: String },
  weight: { type: Number },
  extraFields: { type: Map, of: String } 
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);