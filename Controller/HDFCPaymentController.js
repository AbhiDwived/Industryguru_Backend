const fs = require("fs");
const crypto = require('crypto');
const SANDBOX_BASE_URL = "https://smartgateway.hdfcbank.com";
const PRODUCTION_BASE_URL = "https://smartgateway.hdfcbank.com";
const SECURE_KEY = "64EE722B97347EEB15159DA2FAB9A8";
const config = require("../justpay/config.json");
const path = require("path");
const publicKey = fs.readFileSync(config.PUBLIC_KEY_PATH);
const privateKey = fs.readFileSync(config.PRIVATE_KEY_PATH);
const paymentPageClientId = config.PAYMENT_PAGE_CLIENT_ID; // used in orderSession request

const Checkout = require("../Models/Checkout");
const Product = require("../Models/Product");
const PaymentInfo = require("../Models/PaymentInfo");

const { Juspay, APIError } = require("expresscheckout-nodejs");
const juspay = new Juspay({
  merchantId: config.MERCHANT_ID,
  baseUrl: SANDBOX_BASE_URL,
  jweAuth: {
    keyId: config.KEY_UUID,
    publicKey,
    privateKey,
  },
});

// Helper function to generate SHA-256 hash
const generateHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

async function initializePayment(req, res) {
  try {
    const requestUrl = `${req.protocol}://${req.get('host')}`;

    var data = req.body;
    let total = 0;

    if (!data.id) {
      data = new Checkout(req.body);
      for (const item of data.products) {
        const p = await Product.findOne({ _id: item.productid }).select('addedBy finalprice');
        item.addedBy = p?.addedBy;
        item.price = p?.finalprice;  
        item.total = (p?.finalprice * item?.qty);
        total += (p?.finalprice * item.qty);
      }
      await data.save();
    }

    total = total + ( total * 0.18) + data.shipping;
    const orderId = `order_${data.id}`;
    const amount = data.total;
    console.log("error")

    if (total.toFixed(3) != amount.toFixed(3)) {
      return res.status(400).json({ message: "Something went wrong, please try again later" });
    }

    const r = (Math.random() + 1).toString(36).substring(7);
    const returnUrl = `https://api.industryguru.in/api/processpayment/${data.id}/${r}`;

    const sessionResponse = await juspay.orderSession.create({
      order_id: orderId,
      amount: total,
      payment_page_client_id: paymentPageClientId,
      customer_id: data.userid,
      action: "paymentPage",
      return_url: returnUrl,
      currency: "INR",
    });

    // **Generate SHA-256 Hash for request data**
    const requestHash = generateHash(JSON.stringify({ order_id: orderId, amount: total, customer_id: data.userid }));
    console.log(`🔹 Request Hash: ${requestHash}`);

    return res.json({
      ...sessionResponse,
      requestHash: requestHash // Including hash in response (optional)
    });

  } catch (error) {
    console.log(error);
    if (error instanceof APIError) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(400).json({ message: "Something went wrong" });
  }
}
// async function initializePayment(req, res) {
//   try {
//     const requestUrl = `${req.protocol}://${req.get("host")}`;

//     var data = req.body;
//     let total = 0;

//     if (!data.id) {
//       data = new Checkout(req.body);
//       for (const item of data.products) {
//         const p = await Product.findOne({ _id: item.productid }).select("addedBy finalprice");
//         item.addedBy = p?.addedBy;
//         item.price = p?.finalprice;
//         item.total = p?.finalprice * item?.qty;
//         total += p?.finalprice * item.qty;
//       }
//       await data.save();
//     }

//     // ✅ Calculate total amount with GST (18%) and shipping
//     total = total + total * 0.18 + data.shipping;
//     const orderId = `order_${data.id}`;
//     const amount = data.total;

//     if (total.toFixed(3) !== amount.toFixed(3)) {
//       return res.status(400).json({ message: "Amount mismatch, please try again." });
//     }

//     // ✅ Generate return URL (redirects user after payment)
//     const r = (Math.random() + 1).toString(36).substring(7);
//     const returnUrl = `https://industryguru.in/confirmation/${data.id}`;

//     // ✅ Call SmartGateway API to create payment session
//     const sessionResponse = await juspay.orderSession.create({
//       order_id: orderId,
//       amount: total,
//       payment_page_client_id: paymentPageClientId,
//       customer_id: data.userid,
//       action: "paymentPage",
//       return_url: returnUrl,
//       currency: "INR",
//     });

//     // ✅ Generate SHA-256 Hash for request data (for security)
//     const requestHash = generateHash(
//       JSON.stringify({ order_id: orderId, amount: total, customer_id: data.userid })
//     );
//     console.log(`🔹 Request Hash: ${requestHash}`);

//     // ✅ Return SmartGateway Payment URL
//     return res.json({
//       payment_url: sessionResponse.payment_page_url, // SmartGateway Payment Page
//       requestHash: requestHash, // Optional for validation
//     });
//   } catch (error) {
//     console.error(error);
//     if (error instanceof APIError) {
//       return res.status(400).json({ message: error.message });
//     }
//     return res.status(500).json({ message: "Payment initialization failed" });
//   }
// }


async function postPayment(req, res) {
  const { signature, signature_algorithm, status_id, status, order_id } = req.body;

  if (!order_id) {
    return res.json({ message: "order_id not present or cannot be empty" });
  }

  var data = await Checkout.findOne({ _id: req.params._id });

  try {
    const statusResponse = await juspay.order.status(order_id);

    var paymentDetail = new PaymentInfo({
      userid: data.userid,
      paymentId: statusResponse.id,
      orderId: req.params._id,
      paymentOrderId: statusResponse.order_id,
      dateCreated: statusResponse.order_id,
      status: statusResponse.status,
      txnId: statusResponse.txn_id,
      paymentInfo: statusResponse,
    });
    
    await paymentDetail.save();

    // **Generate SHA-256 Hash for response data**
    const responseHash = generateHash(JSON.stringify(statusResponse));
    console.log(` Response Hash: ${responseHash}`);

    if (statusResponse.status === "CHARGED") {
      data.paymentstatus = statusResponse.status;
      data.paymentInfo.unshift({ paymentid: paymentDetail.id });
      await data.save();
    }

    return res.send(
      Buffer.from(
        `<h2>processing<script>window.location.href="https://industryguru.in/confirmation/${req.params._id}"</script></h2>`
      )
    );
  } catch (error) {
    console.error("Payment Verification Error:", error);
  }
}

// async function postPayment(req, res) {
//   const { signature, signature_algorithm, status_id, status, order_id } = req.body;

//   if (!order_id) {
//     return res.status(400).json({ message: "Invalid order ID" });
//   }

//   try {
//     // ✅ Get order details from DB
//     var data = await Checkout.findOne({ _id: req.params._id });

//     // ✅ Check payment status in Juspay/SmartGateway
//     const statusResponse = await juspay.order.status(order_id);

//     var paymentDetail = new PaymentInfo({
//       userid: data.userid,
//       paymentId: statusResponse.id,
//       orderId: req.params._id,
//       paymentOrderId: statusResponse.order_id,
//       dateCreated: statusResponse.order_id,
//       status: statusResponse.status,
//       txnId: statusResponse.txn_id,
//       paymentInfo: statusResponse,
//     });

//     await paymentDetail.save();

//     // ✅ Generate SHA-256 Hash for response data
//     const responseHash = generateHash(JSON.stringify(statusResponse));
//     console.log(`🔹 Response Hash: ${responseHash}`);

//     // ✅ If payment is successful, update order status
//     if (statusResponse.status === "CHARGED") {
//       data.paymentstatus = statusResponse.status;
//       data.paymentInfo.unshift({ paymentid: paymentDetail.id });
//       await data.save();
//     }

//     // ✅ Redirect user to confirmation page
//     return res.send(
//       Buffer.from(
//         `<h2>Processing...<script>window.location.href="https://industryguru.in/confirmation/${req.params._id}"</script></h2>`
//       )
//     );
//   } catch (error) {
//     console.error("Payment Verification Error:", error);
//     return res.status(500).json({ message: "Payment verification failed" });
//   }
// }


module.exports = [initializePayment, postPayment];
