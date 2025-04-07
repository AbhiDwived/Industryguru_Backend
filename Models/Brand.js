const mongoose = require("mongoose");

const BrandShema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name Must Required!!!"],
    unique: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true,
  },
});
const Brand = new mongoose.model("Brand", BrandShema);
module.exports = Brand;
