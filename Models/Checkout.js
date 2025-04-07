const mongoose = require("mongoose")

const CheckoutShema = new mongoose.Schema({
    userid: {
        type: String,
        required: [true, "UsernId Must Required!!!"]
    },
    paymentmode: {
        type: String,
        default: "COD"
    },
    paymentstatus: {
        type: String,
        default: "Pending"
    },
    orderstatus: {
        type: String,
        default: 'Order Placed'
    },
    subtotal: {
        type: Number,
        required: [true, "Subtotal Must Required"]
    },
    shipping: {
        type: Number,
        required: [true, "Shipping Must Required"]
    },
    total: {
        type: Number,
        required: [true, "Total Must Required"]
    },
    rppid : {
        type:String,
        default:""
    },
    date: {
        type: String
    },
    createdAt: {
        type: Number,
        default: Date.now
    },
    products: [
        {
            productid: {
                type: String
            },
            name: {
                type: String
            },
            brand: {
                type: String
            },
            color: {
                type: String
            },
            size: {
                type: String
            },
            price: {
                type: Number
            },
            qty: {
                type: Number,
                default: 1
            },
            total: {
                type: Number
            },
            pic: {
                type: String
            },
            addedBy: {
                type: mongoose.Schema.Types.ObjectId
            }
        }
    ],
    paymentInfo: [
        {
            paymentid: {
                type: String
            }, 
        }
    ]
})
const Checkout = new mongoose.model("Checkout", CheckoutShema)
module.exports = Checkout