const Brand = require("../Models/Brand");

async function createBrand(req, res) {
  try {
    var data = new Brand(req.body);
    await data.save();
    // console.log(data)
    res.send({ result: "Done", message: "Record is Created!!!", data: data });
  } catch (error) {
    console.log(error);
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
async function getAllBrand(req, res) {
  try {
    var data = await Brand.find().sort({ _id: -1 });
    res.send({ result: "Done", count: data.length, data: data });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
} 
async function getSingleBrand(req, res) {
  try {
    var data = await Brand.findOne({ _id: req.params._id });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function getBrandBySubCategory(req, res) {
  try {
    var data = await Brand.find({
      subcategory: req.params.id,
    });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function updateBrand(req, res) {
  try {
    var data = await Brand.findOne({ _id: req.params._id });
    if (data) {
      data.name = req.body.name ?? data.name;
      data.subcategory = req.body.subcategory ?? data.subcategory;
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
async function deleteBrand(req, res) {
  try {
    await Brand.deleteOne({ _id: req.params._id });
    res.send({ result: "Done", message: "Record is Deleted!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
module.exports = [
  createBrand,
  getAllBrand,
  getSingleBrand,
  getBrandBySubCategory,
  updateBrand,
  deleteBrand,
];
