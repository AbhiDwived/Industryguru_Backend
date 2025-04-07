const mongoose = require("mongoose")

const PaymentShema = new mongoose.Schema({
    userid: {
        type: String,
        type: String,
        required: [true, "UsernId Must Required!!!"]
    },
    mode: {
        type: String,
    },
    reference: {
        type: String,
    },
    amount: {
        type: Number,
    },
    gst: {
        type: Number,
    },
    commission: {
        type: Number,
    },
    createdAt: {
        type: Number,
        default: Date.now
    },
})
const Payment = new mongoose.model("Payment", PaymentShema)
module.exports = Payment