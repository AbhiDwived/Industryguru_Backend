const Rating = require("../Models/Rating");

// Get Ratings by Product ID
const getRatingsByProductId = async (req, res) => {
  console.log(req.params.productId, "productId");
  try {
    const data = await Rating.find({ productId: req.params.productId });
    console.log(data, "data");
    if (data.length > 0) {
      res.send({ result: "Done", data: data });
    } else {
      res.send({
        result: "Fail",
        message: "No ratings found for the provided product ID",
      });
    }
  } catch (error) {
    console.error("Error fetching ratings by product ID:", error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
};

// Create Rating
const createRating = async (req, res) => {
  try {
    const { productId, rating, comment, title, image } = req.body;
    const newRating = await Rating.create({
      productId,
      rating,
      comment,
      title,
      image,
    });
    res.status(201).json(newRating);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to create rating", message: error.message });
  }
};

// Update Rating by ID
const updateRatingById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRating = await Rating.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedRating) {
      return res.status(404).json({ error: "Rating not found" });
    }
    res.status(200).json(updatedRating);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update rating", message: error.message });
  }
};

// Delete Rating by ID
const deleteRatingById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRating = await Rating.findByIdAndDelete(id);
    if (!deletedRating) {
      return res.status(404).json({ error: "Rating not found" });
    }
    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete rating", message: error.message });
  }
};

module.exports = [
  getRatingsByProductId,
  createRating,
  updateRatingById,
  deleteRatingById,
];
