const mongoose = require("mongoose")

const PaymentInfoShema = new mongoose.Schema({
    userid: {
        type: String,
        type: String,
        required: [true, "UsernId Must Required!!!"]
    },
    paymentId: {
        type: String,
    },
    orderId: {
        type: String,
    },
    status: {
        type: String,
    },
    txnId: {
        type: String,
    },        
    paymentInfo: {
        type: Object,
    },
    dateCreated: {
        type: Object,
    },
    paymentOrderId: {
        type: String,
    }
})
const PaymentInfo = new mongoose.model("PaymentInfo", PaymentInfoShema)
module.exports = PaymentInfo