const fs = require("fs");
const Checkout = require("../Models/Checkout");
const Product = require("../Models/Product");
const User = require("../Models/User");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const { MongoClient } = require("mongodb");
const PaymentInfo = require("../Models/PaymentInfo");

// Function to send email using nodemailer
async function sendEmailWithAttachment(receiver, subject, text, attachment) {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let info = await transporter.sendMail({
      from: `"IndustryGuru" <${process.env.SMTP_USER}>`,
      to: receiver,
      subject: subject,
      html: text,
      attachments: [
        {
          filename: "Invoice.pdf", // Include user name in filename
          content: attachment,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
  }
}

//Payment API
function order(req, res) {
  try {
    const instance = new Razorpay({
      key_id: process.env.RPKEYID,
      key_secret: process.env.RPSECRETKEY,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ result: "Fail", message: "Something Went Wrong!" });
      }
      res.status(200).json({ result: "Done", data: order });
    });
  } catch (error) {
    res.status(500).json({ result: "Fail", message: "Internal Server Error!" });
    console.log(error);
  }
}

async function verify(req, res) {
  try {
    var check = await Checkout.findOne({ _id: req.body.checkid });
    for (const item of check.products) {
      const p = await Product.findOne({ _id: item.productid }).select('addedBy');
      item.addedBy = p?.addedBy;
    }
    check.rppid = req.body.razorpay_payment_id;
    check.paymentstatus = "Done";
    check.paymentmode = "Net Banking";
    await check.save();
    res.status(200).send({ result: "Done" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

async function createCheckout(req, res) {
  try {
    var data = new Checkout(req.body);
    for (const item of data.products) {
      const p = await Product.findOne({ _id: item.productid }).select('addedBy');
      item.addedBy = p?.addedBy;
    }
    data.date = new Date();

    // Calculate GST (assuming a GST rate of 18%)
    const gstAmount = data.subtotal * 0.18;

    // Total amount including GST
    const totalWithGST = data.total;

    // Assign total amount including GST to the checkout data
    data.total = totalWithGST;

    await data.save();

    const user = await User.findOne({ _id: data.userid });

    if (!user) {
      console.error("User not found for ID:", data.userid);
      return res
        .status(404)
        .send({ result: "Fail", message: "User not found" });
    }

    let userDetails = `
      <div style="width: 80%; margin: 30px auto; background-color: #fff; padding: 10px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <div style="border-top: 1px solid #ccc; margin-top: 5px; padding-top: 5px;">
      <h2 style="color: #333; margin-bottom: 10px;"><i class="fas fa-truck" style="margin-right: 10px; color: #333;"></i>Congratulations Your order Has Been Placed </h2>
        <h2 style="color: #333; margin-bottom: 10px;"><i class="fas fa-truck" style="margin-right: 10px; color: #333;"></i>Shipping Address</h2>
        <p style="margin-bottom: 10px; color: #666;"><strong>Name:</strong>${user.name}</p>
        <p style="margin-bottom: 10px; color: #666;"><strong>Address1:</strong>${user.addressline1}</p>
        <p style="margin-bottom: 10px; color: #666;"><strong>Address2:</strong>${user.addressline2}</p>
        <p style="margin-bottom: 10px; color: #666;"><strong>Address3:</strong>${user.addressline3}</p>
         <p style="margin-bottom: 10px; color: #666;"><strong>State:</strong>${user.state}</p>
        <p style="margin-bottom: 10px; color: #666;"><strong>City:</strong>${user.city}</p>
        <p style="margin-bottom: 10px; color: #666;"><strong>Zip Code:</strong>${user.pin}</p>
      </div>
        <div style="border-top: 1px solid #ccc; margin-top: 5px; padding-top: 5px;">
          <p style="margin-bottom: 10px; color: #666;"><strong>Order ID:</strong> ${data._id}</p>
          <p style="margin-bottom: 10px; color: #666;"><strong>Order Date:</strong> ${data.date}</p>
          <p style="margin-bottom: 10px; color: #666;"><strong>GST @18%:</strong> ${gstAmount}</p>
          <p style="margin-bottom: 10px; color: #666;"><strong>Total Amount:</strong> ${totalWithGST}</p>
          <p style="margin-bottom: 10px; color: #666;"><strong>Payment Status:</strong> ${data.paymentstatus}</p>
          <!-- Add more order details here if needed -->
        </div>
      </div>
    `;

    data.products.forEach((product) => {
      userDetails += `
      <div style="width: 80%; margin: 30px auto; background-color: #fff; padding: 10px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="border-top: 1px solid #ccc; margin-top: 5px; padding-top: 5px;"> 
          <h2 style="color: #333; margin-bottom: 10px;"><i class="fas fa-truck" style="margin-right: 10px; color: #333;"></i>Product Details</h2>
          <p style="margin-bottom: 10px; color: #666;"><strong>Product Name:</strong>${product.name}</p>
          <p style="margin-bottom: 10px; color: #666;"><strong>Product Brand:</strong>${product.brand}</p>
          <p style="margin-bottom: 10px; color: #666;"><strong>Product Color:</strong>${product.color}</p>
          <p style="margin-bottom: 10px; color: #666;"><strong>Product Size:</strong>${product.size}</p>
          <p style="margin-bottom: 10px; color: #666;"><strong>Product Quantity:</strong>${product.qty}</p>
          <p style="margin-bottom: 10px; color: #666;"><strong>Total Amount:</strong>${totalWithGST}</p>
        </div>
      </div>
      `;
    });

    // Create a write stream for PDF
    const pdfPath = `./orderDetails_${user.name}_${Date.now()}.pdf`;
    const pdfStream = fs.createWriteStream(pdfPath);

    // Generate PDF
    const doc = new PDFDocument();
    doc.pipe(pdfStream);

    // Add user details to PDF
    doc.font("Helvetica");
    doc.fontSize(16).text("Order Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text("ID:", { continued: true }).text(user._id);
    doc.moveDown();
    doc.text("Name:", { continued: true }).text(user.name);
    doc.moveDown();
    doc.text("Email:", { continued: true }).text(user.email);
    doc.moveDown();
    doc.text("Phone:", { continued: true }).text(user.phone);
    doc.moveDown();
    doc.text("Address:", { continued: true }).text(user.addressline1);
    doc.moveDown();
    doc.text("Address2:", { continued: true }).text(user.addressline2);
    doc.moveDown();
    doc.text("State:", { continued: true }).text(user.state);
    doc.moveDown();
    doc.text("City:", { continued: true }).text(user.city);
    doc.moveDown();
    doc.text("PIN:", { continued: true }).text(user.pin);
    doc.moveDown();
    doc.text("Payment Mode:", { continued: true }).text(data._id);
    doc.moveDown();
    doc.text("Payment Mode:", { continued: true }).text(data.paymentmode);
    doc.moveDown();
    doc.text("Order Status:", { continued: true }).text(data.orderstatus);
    doc.moveDown();
    doc.text("Subtotal:", { continued: true }).text(data.subtotal);
    doc.moveDown();
    doc.text("Shipping:", { continued: true }).text(data.shipping);
    doc.moveDown();
    doc.text("GST:", { continued: true }).text(gstAmount);
    doc.moveDown();
    doc.text("Total:", { continued: true }).text(totalWithGST);
    doc.moveDown();
    doc.text("Date:", { continued: true }).text(data.date);

    doc.end();

    // Wait for PDF generation
    await new Promise((resolve, reject) => {
      pdfStream.on("finish", resolve);
      pdfStream.on("error", reject);
    });

    const pdfBuffer = fs.readFileSync(pdfPath);

    // Send email with PDF attachment to user
    await sendEmailWithAttachment(
      user.email,
      "Payment Success",
      userDetails,
      pdfBuffer
    );

    // Send email to admin
    await sendEmailWithAttachment(
      "abhinandan.dharduivedi@gmail.com",
      "Product Details",
      userDetails,
      pdfBuffer
    );

    await savePdfToDatabase(pdfPath, user, data);

    res.send({ result: "Done", message: "Record is Created!!!", data: data });
  } catch (error) {
    console.error("Error in createCheckout:", error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function savePdfToDatabase(pdfPath, user, checkoutData) {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const client = new MongoClient(process.env.DBKEY, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const database = client.db("Industryguru");
    const collection = database.collection("invoices");

    const document = {
      UserName: user.name,
      CheckOut: [
        checkoutData._id,
        checkoutData.orderstatus,
        checkoutData.paymentmode,
      ],
      pdfData: pdfBuffer,
    };

    await collection.insertOne(document);

    console.log("PDF saved to database.");

    await client.close();
  } catch (error) {
    console.error("Error saving PDF to database:", error);
  }
}

async function getAllCheckout(req, res) {
  try {
    var data = await Checkout.find().sort({ _id: -1 });
    res.send({ result: "Done", count: data.length, data: data });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function getAllPayments(req, res) {
  try {
    var data = await PaymentInfo.find({ orderId: req.params.orderid });
    console.log(data)
    res.send({ result: "Done", count: data.length, data: data });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function getUserAllCheckout(req, res) {
  try {
    var data = await Checkout.find(req.params.userid == "admin-li" ? {} : { userid: req.params.userid }).sort({
      _id: -1,
    });
    res.send({ result: "Done", count: data.length, data: data });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function getSingleCheckout(req, res) {
  try {
    var data = await Checkout.findOne({ _id: req.params._id });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function getSingleCheckoutUser(req, res) {
  try {
    var data = await Checkout.findOne({ _id: req.params._id, userid: req.params.userid });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function updateCheckout(req, res) {
  try {
    var data = await Checkout.findOne({ _id: req.params._id });
    if (data) {
      data.paymentmode = req.body.paymentmode ?? data.paymentmode;
      data.paymentstatus = req.body.paymentstatus ?? data.paymentstatus;
      data.orderstatus = req.body.orderstatus ?? data.orderstatus;
      data.rppid = req.body.rppid ?? data.rppid;
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

async function deleteCheckout(req, res) {
  try {
    await Checkout.deleteOne({ _id: req.params._id });
    res.send({ result: "Done", message: "Record is Deleted!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

module.exports = [
  createCheckout,
  getAllCheckout,
  getUserAllCheckout,
  getSingleCheckout,
  getSingleCheckoutUser,
  updateCheckout,
  deleteCheckout,
  order,
  verify,
  getAllPayments
];
