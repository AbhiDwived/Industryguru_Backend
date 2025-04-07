const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String, // You can store the image URL
  },
});

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
