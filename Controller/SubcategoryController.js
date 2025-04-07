const Subcategory = require("../Models/Subcategory");

async function createSubcategory(req, res) {
  try {
    const data = new Subcategory(req.body);

    await data.save();
    res.send({ result: "Done", message: "Record is Created!!!", data: data });
  } catch (error) {
    if (error.keyValue)
      res.send({ result: "Fail", message: "Name Must Be Unique!!!" });
    else if (error.errors.name)
      res.send({ result: "Fail", message: error.errors.name.message });
    else
      res
        .status(500)
        .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function getAllSubcategory(req, res) {
  try {
    var data = await Subcategory.find().sort({ _id: -1 });
    res.send({ result: "Done", count: data.length, data: data });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function getSingleSubcategory(req, res) {
  try {
    var data = await Subcategory.findOne({ _id: req.params._id });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function getSubcategoryByMainCategory(req, res) {
  try {
    var data = await Subcategory.find({ maincategory: req.params.id });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function updateSubcategory(req, res) {
  try {
    var data = await Subcategory.findOne({ _id: req.params._id });
    if (data) {
      data.name = req.body.name ?? data.name;
      data.maincategory = req.body.maincategory ?? data.maincategory;

      await data.save();
      res.send({ result: "Done", message: "Record is Updated!!!" });
    } else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    if (error.keyValue)
      res.send({ result: "Fail", message: "Name Must Be Unique!!!" });
    else
      res
        .status(500)
        .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function deleteSubcategory(req, res) {
  try {
    await Subcategory.deleteOne({ _id: req.params._id });
    res.send({ result: "Done", message: "Record is Deleted!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
module.exports = {
  createSubcategory,
  getAllSubcategory,
  getSingleSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoryByMainCategory,
};
