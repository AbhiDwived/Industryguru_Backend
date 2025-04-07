const jwt = require("jsonwebtoken");
const Product = require("../Models/Product");
const Checkout = require("../Models/Checkout");
//const multer = require('multer')
const fs = require("fs");
const { MongoClient, ObjectId } = require("mongodb");
const mongoose = require("mongoose");

async function createProduct(req, res) {
  try {
    // Decode the JWT token from the request header
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_ADMIN_KEY
    );

    // Create a new product object with request data and addedBy field
    const data = new Product({
      ...req.body,
      addedBy: decoded.data._id,
    });

    // Handle uploaded files safely
    try {
      data.pic1 = req.files?.pic1?.[0]?.filename || "";
      console.log("data.pic1:", data.pic1);
    } catch (error) {
      console.error("Error with pic1:", error);
    }

    try {
      data.pic2 = req.files?.pic2?.[0]?.filename || "";
      console.log("data.pic2:", data.pic2);
    } catch (error) {
      console.error("Error with pic2:", error);
    }

    try {
      data.pic3 = req.files?.pic3?.[0]?.filename || "";
      console.log("data.pic3:", data.pic3);
    } catch (error) {
      console.error("Error with pic3:", error);
    }

    try {
      data.pic4 = req.files?.pic4?.[0]?.filename || "";
      console.log("data.pic4:", data.pic4);
    } catch (error) {
      console.error("Error with pic4:", error);
    }

    // Parse specification field if provided as JSON
    if (data.specification) {
      data.specification = JSON.stringify(data.specification);
    }

    // Save the product to the database
    await data.save();
    res.send({ result: "Done", message: "Record is Created!!!", data: data });
  } catch (error) {
    console.error("Error in createProduct:", error);

    // Handle known validation errors
    const errorMessage =
      error.errors?.name?.message ||
      error.errors?.maincategory?.message ||
      error.errors?.subcategory?.message ||
      error.errors?.brand?.message ||
      error.errors?.color?.message ||
      error.errors?.size?.message ||
      error.errors?.baseprice?.message ||
      error.errors?.finalprice?.message ||
      error.errors?.pic1?.message ||
      "Internal Server Error!!!";

    // Send appropriate response with status
    res.status(500).send({ result: "Fail Posted data", message: errorMessage });
  }
}


// async function createProduct(req, res) {
//   try {
//     var decoded = jwt.verify(
//       req.headers.authorization,
//       process.env.JWT_ADMIN_KEY
//     );
//     var data = new Product({
//       ...req.body,
//       addedBy: decoded.data._id,
//     });

//     try {
//       data.pic1 = req.files.pic1[0].filename;
//       console.log("data.pic1");
//     } catch (error) {}
//     try {
//       data.pic2 = req.files.pic2[0].filename;
//       console.log("data.pic2");
//     } catch (error) {}
//     try {
//       data.pic3 = req.files.pic3[0].filename;
//       console.log("data.pic3");
//     } catch (error) {}
//     try {
//       data.pic4 = req.files.pic4[0].filename;
//       console.log("data.pic4");
//     } catch (error) {}
//     data.specification = JSON.parse(data.specification);
//     await data.save();
//     res.send({ result: "Done", message: "Record is Created!!!", data: data });
//   } catch (error) {
//     if (error.errors?.name?.message)
//       res.send({ result: "Fail", message: error.errors.name.message });
//     else if (error.errors?.maincategory?.message)
//       res.send({ result: "Fail", message: error.errors.maincategory.message });
//     else if (error.errors?.subcategory?.message)
//       res.send({ result: "Fail", message: error.errors.subcategory.message });
//     else if (error.errors?.brand?.message)
//       res.send({ result: "Fail", message: error.errors.brand.message });
//     else if (error.errors?.color?.message)
//       res.send({ result: "Fail", message: error.errors.color.message });
//     else if (error.errors?.size?.message)
//       res.send({ result: "Fail", message: error.errors.size.message });
//     else if (error.errors?.baseprice?.message)
//       res.send({ result: "Fail", message: error.errors.baseprice.message });
//     else if (error.errors?.finalprice?.message)
//       res.send({ result: "Fail", message: error.errors.finalprice.message });
//     else if (error.errors?.pic1?.message)
//       res.send({ result: "Fail", message: error.errors.pic1.message });
//     else
//       res
//         .status(500)
//         .send({ result: "Fail data", message: "Internal Server Error!!!" });
//   }
// }

async function CreateProductByVendor(req, res) {
  try {
    var decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_VENDOR_KEY
    );
    var data = new Product({
      ...req.body,
      addedBy: decoded.data._id,
    });
    try {
      data.pic1 = req.files.pic1[0].filename;
    } catch (error) {}
    try {
      data.pic2 = req.files.pic2[0].filename;
    } catch (error) {}
    try {
      data.pic3 = req.files.pic3[0].filename;
    } catch (error) {}
    try {
      data.pic4 = req.files.pic4[0].filename;
    } catch (error) {}
    data.specification = JSON.stringify(data.specification);
    await data.save();
    res.send({ result: "Done", message: "Record is Created!!!", data: data });
  } catch (error) {
    console.log("Error Create product by vendor", error)
  //   if (error.errors.name)
  //     res
  //       .status(500)
  //       .send({ result: "Fail", message: error.errors.name.message });
  //   else if (error.errors.maincategory)
  //     res
  //       .status(500)
  //       .send({ result: "Fail", message: error.errors.maincategory.message });
  //   else if (error.errors.subcategory)
  //     res
  //       .status(500)
  //       .send({ result: "Fail", message: error.errors.subcategory.message });
  //   else if (error.errors.brand)
  //     res
  //       .status(500)
  //       .send({ result: "Fail", message: error.errors.brand.message });
  //   else if (error.errors.color)
  //     res
  //       .status(500)
  //       .send({ result: "Fail", message: error.errors.color.message });
  //   else if (error.errors.size)
  //     res
  //       .status(500)
  //       .send({ result: "Fail", message: error.errors.size.message });
  //   else if (error.errors.baseprice)
  //     res
  //       .status(500)
  //       .send({ result: "Fail", message: error.errors.baseprice.message });
  //   else if (error.errors.finalprice)
  //     res
  //       .status(500)
  //       .send({ result: "Fail", message: error.errors.finalprice.message });
  //   else if (error.errors.pic1)
  //     res
  //       .status(500)
  //       .send({ result: "Fail", message: error.errors.pic1.message });
  //   else
  //     res
  //       .status(400)
  //       .send({ result: "Fail", message: "Internal Server Error!!!" });
  // }
  const errorMessage =
       error.errors?.name?.message ||
       error.errors?.maincategory?.message ||
       error.errors?.subcategory?.message ||
       error.errors?.brand?.message ||
       error.errors?.color?.message ||
       error.errors?.size?.message || 
       error.errors?.baseprice?.message  ||
       error.errors?.finalprice?.message ||
       error.errors?.pic1?.message ||
       "Internal Server Error";
       res.status(500).send({result:"Failed Posted data", message:errorMessage})
    }
}
 // eslint-disable-next-line
async function getAllProduct(req, res) {
  try {
    var data = await Product.find().populate("brand").sort({ _id: -1 });
    res.send({ result: "Done", count: data.length, data: data });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function getAllProductByVendor(req, res) {
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
      addedBy: user,
    };
    if (search) {
      query.name = { $regex: new RegExp(search, "i") };
    }
    var data = await Product.find(query)
      .populate("brand")
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);
    var count = await Product.count(query).populate("brand").sort({ _id: -1 });
    res.send({ result: "Done", count: count, data: data });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function getSingleProduct(req, res) {
  try {
    var data = await Product.findOne({ _id: req.params._id });
    console.log(data);
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function getProductByMainCategory(req, res) {
  try {
    var data = await Product.find({ maincategory: req.params._id });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function getProductBySubCategory(req, res) {
  try {
    var data = await Product.find({ subcategory: req.params._id });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function getProductByBrand(req, res) {
  try {
    var data = await Product.find({ brand: req.params._id });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function updateProduct(req, res) {
  try {
    var data = await Product.findOne({ _id: req.params._id });
    if (data) {
      data.name = req.body.name ?? data.name;
      data.maincategory = req.body.maincategory ?? data.maincategory;
      data.subcategory = req.body.subcategory ?? data.subcategory;
      data.brand = req.body.brand ?? data.brand;
      data.color = req.body.color ?? data.color;
      data.size = req.body.size ?? data.size;
      data.baseprice = req.body.baseprice ?? data.baseprice;
      data.discount = req.body.discount ?? data.discount;
      data.finalprice = req.body.finalprice ?? data.finalprice;
      data.stock = req.body.stock ?? data.stock;
      data.description = req.body.description ?? data.description;
      data.specification = req.body.specification ?? data.specification;

      try {
        if (req.files.pic1[0] && data.pic1) {
          fs.unlinkSync("public/products/" + data.pic1);
        }
        data.pic1 = req.files.pic1[0].filename;
      } catch (error) {}
      try {
        if (req.files.pic2[0] && data.pic2) {
          fs.unlinkSync("public/products/" + data.pic2);
        }
        data.pic2 = req.files.pic2[0].filename;
      } catch (error) {}
      try {
        if (req.files.pic3[0] && data.pic3) {
          fs.unlinkSync("public/products/" + data.pic3);
        }
        data.pic3 = req.files.pic3[0].filename;
      } catch (error) {}
      try {
        if (req.files.pic4[0] && data.pic4) {
          fs.unlinkSync("public/products/" + data.pic4);
        }
        data.pic4 = req.files.pic4[0].filename;
      } catch (error) {}

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
async function updateProductByVendor(req, res) {
  try {
    var decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_VENDOR_KEY
    );
    const user = decoded.data._id;
    var data = await Product.findOne({ _id: req.params._id, addedBy: user });
    if (data) {
      data.name = req.body.name ?? data.name;
      data.maincategory = req.body.maincategory ?? data.maincategory;
      data.subcategory = req.body.subcategory ?? data.subcategory;
      data.brand = req.body.brand ?? data.brand;
      data.color = req.body.color ?? data.color;
      data.size = req.body.size ?? data.size;
      data.baseprice = req.body.baseprice ?? data.baseprice;
      data.discount = req.body.discount ?? data.discount;
      data.finalprice = req.body.finalprice ?? data.finalprice;
      data.stock = req.body.stock ?? data.stock;
      data.description = req.body.description ?? data.description;
      data.specification = JSON.parse(req.body.specification);
      try {
        if (req.files.pic1[0] && data.pic1) {
          fs.unlinkSync("public/products/" + data.pic1);
        }
        data.pic1 = req.files.pic1[0].filename;
      } catch (error) {}
      try {
        if (req.files.pic2[0] && data.pic2) {
          fs.unlinkSync("public/products/" + data.pic2);
        }
        data.pic2 = req.files.pic2[0].filename;
      } catch (error) {}
      try {
        if (req.files.pic3[0] && data.pic3) {
          fs.unlinkSync("public/products/" + data.pic3);
        }
        data.pic3 = req.files.pic3[0].filename;
      } catch (error) {}
      try {
        if (req.files.pic4[0] && data.pic4) {
          fs.unlinkSync("public/products/" + data.pic4);
        }
        data.pic4 = req.files.pic4[0].filename;
      } catch (error) {}

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
async function deleteProduct(req, res) {
  try {
    var data = await Product.findOne({ _id: req.params._id });
    try {
      fs.unlink("public/products/" + data.pic1);
    } catch (error) {}
    try {
      fs.unlink("public/products/" + data.pic2);
    } catch (error) {}
    try {
      fs.unlink("public/products/" + data.pic3);
    } catch (error) {}
    try {
      fs.unlink("public/products/" + data.pic4);
    } catch (error) {}

    await data.deleteOne();
    res.send({ result: "Done", message: "Record is Deleted!!!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function deleteProductByVendor(req, res) {
  try {
    var decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_VENDOR_KEY
    );
    const user = decoded.data._id;
    var data = await Product.findOne({ _id: req.params._id, addedBy: user });
    try {
      fs.unlink("public/products/" + data.pic1);
    } catch (error) {}
    try {
      fs.unlink("public/products/" + data.pic2);
    } catch (error) {}
    try {
      fs.unlink("public/products/" + data.pic3);
    } catch (error) {}
    try {
      fs.unlink("public/products/" + data.pic4);
    } catch (error) {}

    await data.deleteOne();
    res.send({ result: "Done", message: "Record is Deleted!!!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function searchProduct(req, res) {
  try {
    var data = await Product.find({
      $or: [
        { name: { $regex: req.body.search, $options: "i" } },
        { maincategory: req.body.search },
        { subcategory: req.body.search },
        { brand: req.body.search },
        { color: { $regex: req.body.search, $options: "i" } },
        { size: { $regex: req.body.search, $options: "i" } },
        { stock: { $regex: req.body.search, $options: "i" } },
        { description: { $regex: req.body.search, $options: "i" } },
      ],
    });
    res.send({ result: "Done", count: data.length, data: data });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

function getLast7Days() {
  let dates = [];
  for (let i = 6; i >= 0; i--) {
    let date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().slice(0, 10)); // Get YYYY-MM-DD format
  }
  return dates;
}

function getCurrentMonthDates() {
  let dates = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  console.log(today.getDate())
  // Loop through from the 1st day of the month until today's date
  for (let i = 2; i <= today.getDate() + 1; i++) {
    let date = new Date(year, month, i);
    dates.push(date.toISOString().slice(0, 10)); // Get YYYY-MM-DD format
  }
  return dates;
}

function getLastMonthDates() {
  let dates = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Calculate the previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = prevMonth === 11 ? year - 1 : year;

  // Get the last day of the previous month
  const lastDayPrevMonth = new Date(year, month, 0).getDate();

  // Loop through from the 1st day of the previous month until the last day
  for (let i = 1; i <= lastDayPrevMonth; i++) {
    let date = new Date(prevYear, prevMonth, i);
    dates.push(date.toISOString().slice(0, 10)); // Get YYYY-MM-DD format
  }
  return dates;
}

function getLast3MonthsNames(size = 3) {
  let today = new Date();
  let month = today.getMonth(); // current month index (0-11)
  let year = today.getFullYear();

  let result = [];
  for (let i = 0; i < size; i++) {
    if (month < 0) {
      month = 11; // adjust back to December if we loop back
      year--; // move back a year
    }
    result.unshift(months[month] + " " + year);
    month--;
  }
  return result;
}
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getThisYearMonthsNames(last = 0) {
  const today = new Date();
  const year = today.getFullYear() - last;

  let result = [];
  for (let month = 0; month < 12; month++) {
    result.push(months[month] + " " + year);
  }
  return result;
}

async function getVendorDashboard(req, res) {
  var decoded = jwt.verify(
    req.headers.authorization,
    process.env.JWT_VENDOR_KEY
  );
  const user = decoded.data._id;
  try {
    var totalProducts = await Product.count({
      addedBy: user,
    })
      .populate("brand")
      .sort({ _id: -1 });

    const search = req.query.search || "7days";
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    let labels = getLast7Days();

    switch (search) {
      case "7days":
        startOfToday.setDate(startOfToday.getDate() - 7);
        labels = getLast7Days();
        break;
      case "month":
        startOfToday.setDate(1);
        labels = getCurrentMonthDates();
        break;
      case "lastmonth":
        startOfToday.setDate(1);
        startOfToday.setMonth(startOfToday.getMonth() - 1);
        endOfToday.setMonth(startOfToday.getMonth());
        endOfToday.setDate(0); // Set to last day of previous month
        labels = getLastMonthDates();
        break;
      case "last3month":
        startOfToday.setMonth(startOfToday.getMonth() - 3);
        labels = getLast3MonthsNames();
        break;
      case "last6month":
        startOfToday.setMonth(startOfToday.getMonth() - 6);
        labels = getLast3MonthsNames(6);
        break;
      case "last12month":
        startOfToday.setMonth(startOfToday.getMonth() - 12);
        labels = getLast3MonthsNames(12);
        break;
      case "year":
        startOfToday.setMonth(0);
        startOfToday.setDate(1);
        endOfToday.setMonth(11);
        endOfToday.setDate(31);
        labels = getThisYearMonthsNames();
        break;
      case "lastyear":
        startOfToday.setMonth(0);
        startOfToday.setDate(1);
        startOfToday.setFullYear(startOfToday.getFullYear() - 1);
        endOfToday.setMonth(11);
        endOfToday.setDate(31);
        endOfToday.setFullYear(endOfToday.getFullYear() - 1);
        labels = getThisYearMonthsNames(1);
        break;
      default:
        // Handle default case or throw an error
        break;
    }
    const size = labels.length;

    var totalOrder = await Checkout.count({
      "products.addedBy": user,
      createdAt: { $gte: startOfToday.getTime(), $lte: endOfToday.getTime() },
    });

    var totalPending = await Checkout.count({
      "products.addedBy": user,
      orderstatus: { $ne: "Delivered" },
      createdAt: { $gte: startOfToday.getTime(), $lte: endOfToday.getTime() },
    });

    const statuses = [
      "Order Placed",
      "Packed",
      "Ready to Ship",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];

    const orderReport = [0, 0, 0, 0, 0, 0];
    const salesReport = {
      labels,
      datasets: statuses.map((item) => {
        return {
          label: item,
          borderWidth: 1,
          data: Array.from(Array(size), () => 0),
        };
      }),
    };

    const earningReport = {
      labels,
      datasets: statuses.map((item) => {
        return {
          label: item,
          borderWidth: 1,
          data: Array.from(Array(size), () => 0),
        };
      }),
    };

    var totalOrders = await Checkout.find({
      "products.addedBy": user,
      // orderstatus: { $ne: "Delivered" },
      createdAt: { $gte: startOfToday.getTime(), $lte: endOfToday.getTime() },
    }).select("products.addedBy products.total orderstatus date");
    let totalEarning = 0;
    totalOrders.forEach((item) => {
      const index = statuses.indexOf(item.orderstatus);
      orderReport[index] += 1;

      const date = new Date(item.date);
      const d = ["7days", "month", "lastmonth"].includes(search)
        ? date.toISOString().slice(0, 10)
        : `${months[date.getMonth()]} ${date.getFullYear()}`;
      let i = labels.indexOf(d);
      salesReport.datasets[index].data[i] += 1;
      item.products.forEach((product) => {
        if (product.addedBy == user) {
          earningReport.datasets[index].data[i] += product.total;
          totalEarning += product.total;
        }
      });
    });

    res.send({
      result: "Done",
      totalProducts,
      totalEarning,
      totalOrder,
      totalPending,
      orderReport,
      salesReport,
      earningReport,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      result: "Fail",
      message: "Internal Server Error!!!",
      error: error,
    });
  }
}
async function getAllCheckoutByVendor(req, res) {
  var decoded = jwt.verify(
    req.headers.authorization,
    process.env.JWT_VENDOR_KEY
  );
  const user = decoded.data._id;
  const limit = 10;
  const skip = (req.query?.page || 0) * limit;
  const search = req.query?.search || "";
  const paymentstatus = req.query?.paymentstatus || "";
  const orderStatus = req.query?.orderStatus || "";

  const query = {
    "products.addedBy": user,
  };
  if (search) {
    query._id = search;
  }
  if ( paymentstatus ) {
    query.paymentstatus = { $regex: new RegExp(paymentstatus, "i") };
  }

  if ( orderStatus ) {
    query.orderstatus = { $regex: new RegExp(orderStatus, "i") };
  }

  try {
    var checkouts = await Checkout.find(query).select("products orderstatus date paymentmode paymentstatus").sort({ _id: -1 })
    .limit(limit)
    .skip(skip);
    var count = await Checkout.count(query);
    res.send({
      result: "Done",
      checkouts,
      count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      result: "Fail",
      message: "Internal Server Error!!!",
      error: error,
    });
  }
}

module.exports = [
  createProduct,
  CreateProductByVendor,
  getAllProduct,
  getAllProductByVendor,
  getVendorDashboard,
  getAllCheckoutByVendor,
  getSingleProduct,
  getProductByMainCategory,
  getProductBySubCategory,
  getProductByBrand,
  updateProduct,
  updateProductByVendor,
  deleteProduct,
  deleteProductByVendor,
  searchProduct,
];
