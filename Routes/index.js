const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs")
const passport = require("passport");
const User = require('../Models/User')


const [
  createMaincategory,
  getAllMaincategory,
  getSingleMaincategory,
  updateMaincategory,
  deleteMaincategory,
] = require("../Controller/MaincategoryController");
const {
  createSubcategory,
  getAllSubcategory,
  getSingleSubcategory,
  updateSubcategory,
  getSubcategoryByMainCategory,
  deleteSubcategory,
} = require("../Controller/SubcategoryController");
const [
  createBrand,
  getAllBrand,
  getSingleBrand,
  getBrandBySubCategory,
  updateBrand,
  deleteBrand,
] = require("../Controller/BrandController");
const [
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
] = require("../Controller/ProductController");

const [
  getAllPaymentByVendor,
  createPayment,
  getAllPaymentsAdmin,
  getAdminVendors
] = require("../Controller/Payment");


const [
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser,
  login,
  forgetPassword1,
  forgetPassword2,
  forgetPassword3,
] = require("../Controller/UserController");
const [
  createCart,
  getAllCart,
  getSingleCart,
  updateCart,
  deleteCart,
] = require("../Controller/CartController");
const [
  createWishlist,
  getAllWishlist,
  deleteWishlist,
] = require("../Controller/WishlistController");
const [
  createCheckout,
  getAllCheckout,
  getUserAllCheckout,
  getSingleCheckout,
  getSingleCheckoutUser,
  updateCheckout,
  deleteCheckout,
  order,
  verify,
  getAllPayments,
] = require("../Controller/CheckoutController");
const [
  createNewslatter,
  getAllNewslatter,
  deleteNewslatter,
] = require("../Controller/NewslatterController");
const [
  createContact,
  getAllContact,
  getSingleContact,
  updateContact,
  deleteContact,
] = require("../Controller/ContactController");
const [
  getRatingsByProductId,
  createRating,
  updateRatingById,
  deleteRatingById,
] = require("../Controller/RatingController");

const [
  initializePayment,
  postPayment
] = require("../Controller/PaymentController");
const Product = require("../Models/Product");
// const { default: products } = require("razorpay/dist/types/products");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/products");                                                                                           
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
  limits: {
    fieldSize: 10485760,
  },
});
const upload = multer({ storage: storage });

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "c/users");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
  limits: {
    fieldSize: 10485760,
  },
});

async function verifyAdmin(req, res, next) {
  var token = req.headers.authorization;
  jwt.verify(token, process.env.JWT_ADMIN_KEY, (error) => {
    if (error)
      res.status(401).send({
        result: "Fail",
        message: "You Are Not Authorized to Access This API!!!",
      });
    else next();
  });
}
async function verifyVendor(req, res, next) {
  var token = req.headers.authorization;
  jwt.verify(token, process.env.JWT_VENDOR_KEY, (error) => {
    if (error)
      res.status(401).send({
        result: "Fail",
        message: "You Are Not Authorized to Access Vendor API!!!",
      });
    else next();
  });
}
async function verifyBuyer(req, res, next) {
  var token = req.headers.authorization;
  jwt.verify(token, process.env.JWT_BUYER_KEY, (error) => {
    if (error) {
      console.log(error);
      res.status(401).send({
        result: "Fail",
        message: "You Are Not Authorized to Access This API!!!",
      });
    } else next();
  });
}

async function verifyUser(req, res, next) {
  var token = req.headers.authorization;
  var flag = false;
  jwt.verify(token, process.env.JWT_BUYER_KEY, (error) => {
    if (!error) flag = true;
  });
  if (flag == false) {
    jwt.verify(token, process.env.JWT_ADMIN_KEY, (error) => {
      if (!error) flag = true;
    });
  }
  if (flag == false) {
    jwt.verify(token, process.env.JWT_VENDOR_KEY, (error) => {
      if (!error) flag = true;
    });
  }
  if (flag) next();
  else
    res.status(401).send({
      result: "Fail",
      message: "You Are Not Authorized to Access This API!!!",
    });
}
const upload2 = multer({ storage: storage2 });

const router = express.Router();

router.post("/maincategory", verifyAdmin, createMaincategory);
router.get("/maincategory", getAllMaincategory);
router.get("/maincategory/:_id", getSingleMaincategory);
router.put("/maincategory/:_id", verifyAdmin, updateMaincategory);
router.delete("/maincategory/:_id", verifyAdmin, deleteMaincategory);

router.post("/subcategory", verifyAdmin, createSubcategory);
router.get("/subcategory", getAllSubcategory);
router.get("/subcategory/:_id", getSingleSubcategory);
router.get("/subcategoryByMainId/:id", getSubcategoryByMainCategory);
router.put("/subcategory/:_id", verifyAdmin, updateSubcategory);
router.delete("/subcategory/:_id", verifyAdmin, deleteSubcategory);

router.post("/brand", verifyAdmin, createBrand);
router.get("/brand", getAllBrand);
router.get("/brand/:_id", getSingleBrand);
router.get("/brandBySubCategoryId/:id", getBrandBySubCategory);
router.put("/brand/:_id", verifyAdmin, updateBrand);
router.delete("/brand/:_id", verifyAdmin, deleteBrand);

router.post("/product",upload.fields([
    { name: "pic1", maxCount: 1 },
    { name: "pic2", maxCount: 1 },
    { name: "pic3", maxCount: 1 },
    { name: "pic4", maxCount: 1 },
  ]),
  verifyAdmin,
  createProduct
);
router.get("/product", getAllProduct);
router.get("/product/:_id", getSingleProduct);
router.get("/productByMainCategory/:_id", getProductByMainCategory);
router.get("/productBySubCategory/:_id", getProductBySubCategory);
router.get("/productByBrand/:_id", getProductByBrand);
router.put("/product/:_id", upload.array("pic", 4), verifyAdmin, updateProduct);
router.delete("/product/:_id", verifyAdmin, deleteProduct);

router.post(
  "/vendor-product",
  upload.fields([
    { name: "pic1", maxCount: 1 },
    { name: "pic2", maxCount: 1 },
    { name: "pic3", maxCount: 1 },
    { name: "pic4", maxCount: 1 },
  ]),
  verifyVendor,
  CreateProductByVendor
);
router.get("/vendor-product", verifyVendor, getAllProductByVendor);
router.get("/vendor-dashboard", verifyVendor, getVendorDashboard);
router.get("/vendor-checkout", verifyVendor, getAllCheckoutByVendor);
router.get("/vendor-payment", verifyVendor, getAllPaymentByVendor);
router.post("/vendor-payment", verifyAdmin, createPayment);
router.get("/admin-vendor-payment", verifyAdmin, getAllPaymentsAdmin);
router.get("/admin-vendor-list", verifyAdmin, getAdminVendors);

router.put(
  "/vendor-product/:_id",
  upload.fields([
    { name: "pic1", maxCount: 1 },
    { name: "pic2", maxCount: 1 },
    { name: "pic3", maxCount: 1 },
    { name: "pic4", maxCount: 1 },
  ]),
  verifyVendor,
  updateProductByVendor
);
router.delete("/vendor-product/:_id", verifyVendor, deleteProductByVendor);

router.post("/product/search", searchProduct);

router.post("/user", createUser);
router.get("/user", verifyAdmin, getAllUser);
router.get("/user/:_id", verifyUser, getSingleUser);
router.put("/user/:_id", upload2.single("pic"), verifyUser, updateUser);
router.delete("/user/:_id", verifyAdmin, deleteUser);
router.post("/user/login", login);
router.post("/user/forget-password-1", forgetPassword1);
router.post("/user/forget-password-2", forgetPassword2);
router.post("/user/forget-password-3", forgetPassword3);

router.post("/cart", verifyUser, createCart);
router.get("/cart/:userid", verifyUser, getAllCart);
router.get("/cart/single/:_id", verifyUser, getSingleCart);
router.put("/cart/:_id", verifyUser, updateCart);
router.delete("/cart/:_id", verifyUser, deleteCart);

router.post("/wishlist", verifyUser, createWishlist);
router.get("/wishlist/:userid", verifyUser, getAllWishlist);
router.delete("/wishlist/:_id", verifyUser, deleteWishlist);

router.post("/checkout", verifyBuyer, createCheckout);
router.get("/checkout", verifyAdmin, getAllCheckout);
router.get("/payments/:orderid", verifyAdmin, getAllPayments);
router.get("/checkout/:userid", verifyBuyer, getUserAllCheckout);
router.get("/checkout/single/:_id",verifyAdmin, getSingleCheckout);
router.get("/checkout/singleuser/:_id/:userid", verifyUser, getSingleCheckoutUser);
router.put("/checkout/:_id", verifyAdmin, updateCheckout);
router.delete("/checkout/:_id", verifyAdmin, deleteCheckout);
router.post("/checkout/order", verifyBuyer, order);
// router.post("/smartgateway/order", verifyBuyer, order);
router.post("/checkout/verify", verifyBuyer, verify);

router.post("/newslatter", createNewslatter);
router.get("/newslatter/", verifyAdmin, getAllNewslatter);
router.delete("/newslatter/:_id", verifyAdmin, deleteNewslatter);

router.post("/contact", createContact);
router.get("/contact", verifyAdmin, getAllContact);
router.get("/contact/:_id", verifyAdmin, getSingleContact);
router.put("/contact/:_id", verifyAdmin, updateContact);
router.delete("/contact/:_id", verifyAdmin, deleteContact);

// Get Ratings by Product ID
router.get("/ratings/:productId", verifyUser, getRatingsByProductId);

// Create Rating
router.post("/ratings/:_id", verifyUser, createRating);

// Update Rating by ID
router.put("/ratings/:_id", verifyUser, updateRatingById);

// Delete Rating by ID
router.delete("/ratings/:_id", verifyUser, deleteRatingById);

router.post("/processpayment/:_id/:_url", postPayment);
router.post("/payment", initializePayment);



// exel file integration

router.post('/upload-xlsx',upload.single('file'), async(req,res)=>{
  console.log("run")
  if(!req.file){
    return res.status(400).json({message:"No File Uploaded"});
  }
  try{
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(data)

    const products = data.map(item => ({
      name:item.name,
      maincategory:item.maincategory,
      subcategory:item.subcategory,
      brand:item.brand,
      color:item.color,
      size:item.size,
      finalprice:item.finalprice,
      baseprice:item.baseprice,
      discount:item.discount,
      specification:item.specification,
      description:item.description,
      stock:item.stock,
      pic1:item.pic1

    }))
    
      const saveData = await Product.insertMany(products);
    res.status(200).json({ result: "Done", message: "Product Saved!!!", saveData })

    fs.unlinkSync(filePath);

  }catch(error){
    return res.status(500).json({msg:"Error processing file",error})
  }

})

//==========================login with google configure=======================================// 

router.get('/google',passport.authenticate('google', {scope:['profile','email'] }));

// Google callback routes
router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),
  async(req,res)=>{
    try{
      let user = await User.findOne({googleId:req.user.id});

      if(!user){
        user = new User({
          googleId: req.user.id,
          name:req.user.name,
          email:req.user.emails[0].value,
          role:req.user.emails[0].value === 'admin@example.com' ? 'admin' : 'user',
        });
        await user.save()
      }
      // Generate token
      const token = jwt.sign({id:user._id, role:user.role},process.env.JWT_SECRET,);
      res.redirect(`htpp://localhost:3000/dashboard?token=${token}`) 
    }catch(error){
      res.status(500).json({error:'server error'})
    }
  }
  )



module.exports = router;
