const mongoose = require("mongoose");

const MaincategoryShema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name Must Required!!!"],
    unique: true,
  },
});
const Maincategory = new mongoose.model("Maincategory", MaincategoryShema);
module.exports = Maincategory;
