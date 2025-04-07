const mongoose = require("mongoose");

const ProductShema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, "Name Must Required!!!"],
  },
  maincategory: {
    type: mongoose.Types.ObjectId,
    // required: [true, "Maincategory Must Required!!!"],
    ref: "maincategory",
  },
  subcategory: {
    type: mongoose.Types.ObjectId,
    // required: [true, "Subcategory Must Required!!!"],
    ref: "Subcategory",
  },
  brand: {
    type: mongoose.Types.ObjectId,
    // required: [true, "Brand Must Required!!!"],
    ref: "Brand",
  },
  color: {
    type: String,
    // required: [true, "Color Must Required!!!"],
  },
  size: {
    type: String,
    // required: [true],
  },
  rating:{
    type:String,
    
  },
  pole: {
    type: Number, // or change to String if it holds text
    // add validation if necessary
},
  baseprice: {
    type: Number,
    // required: [true, "Base Price Must Required!!!"],
  },
  discount: {
    type: Number,
    default: 0,
  },
  finalprice: {
    type: Number,
    // required: [true, "Final Price Must Required!!!"],
  },
  stock: {
    type: String,
    default: "In Stock",
  },
  specification: [],
  description: {
    type: String,
    default: "This is Sample Product",
  },
  pic1: {
    type: String,
    // required: [true, "Pic1 Must Required!!!"],
  },
  pic2: {
    type: String,
    default: "",
  },
  pic3: {
    type: String,
    default: "",
  },
  pic4: {
    type: String,
    default: "",
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
});
const Product = new mongoose.model("Product", ProductShema);
module.exports = Product;
