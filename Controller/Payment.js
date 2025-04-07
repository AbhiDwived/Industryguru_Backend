const jwt = require("jsonwebtoken");
const Payment = require("../Models/Payment");
const User = require("../Models/User");
const mongoose = require("mongoose");

async function getAllPaymentByVendor(req, res) {
  const limit = 20;
  const skip = (req.query?.page || 0) * limit;
  const search = req.query?.search || "";
  try {
    var decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_VENDOR_KEY
    );
    const user = decoded.data._id;
    const query = {
      userid: user,
    };
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or = [{ _id: search }];
      } else {
        const searchAsNumber = Number(search) || 0;
        query.$or = [
          { reference: { $regex: new RegExp(search, "i") } },
          { amount: searchAsNumber },
        ];
      }
    }
    var data = await Payment.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);
    var count = await Payment.count(query);
    res.send({ result: "Done", count: count, data: data });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function getAllPaymentsAdmin(req, res) {
  const limit = 20;
  const skip = (req.query?.page || 0) * limit;
  const search = req.query?.search || "";
  const user = req.query?.user || "";
  try {
    const query = {};
    if (user) {
      query.userid = user;
      if (mongoose.Types.ObjectId.isValid(search)) {
        query._id = search;
      } else {
        const searchAsNumber = Number(search) || 0;
        query.$or = [
          { reference: { $regex: new RegExp(search, "i") } },
          { amount: searchAsNumber },
        ];
      }
    } else {
      if (search) {
        if (mongoose.Types.ObjectId.isValid(search)) {
          query.$or = [{ _id: search }, { userid: search }];
        } else {
          const searchAsNumber = Number(search) || 0;
          query.$or = [
            { reference: { $regex: new RegExp(search, "i") } },
            { amount: searchAsNumber },
          ];
        }
      }
    }
    var data = await Payment.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);
    var count = await Payment.count(query);
    res.send({ result: "Done", count: count, data: data });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function createPayment(req, res) {
  try {
    console.log(req.body);
    var data = new Payment(req.body);
    await data.save();
    res.send({ result: "Done", message: "Record is Created!!!", data: data });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function getAdminVendors(req, res) {
  try {
    var data = await User.find({
      role: "Vendor",
    }).select("_id name");
    res.send({ result: "Done", message: "Record is Created!!!", data: data });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

module.exports = [
  getAllPaymentByVendor,
  createPayment,
  getAllPaymentsAdmin,
  getAdminVendors,
];
