const mongoose = require("mongoose")

const CartShema = new mongoose.Schema({
    userid : {
        type:String,
        required:[true,"UsernId Must Required!!!"]
    },
    productid : {
        type:String,
        required:[true,"Product Id Must Required!!!"]
    },
    name : {
        type:String,
        required:[true,"Name Must Required!!!"]
    },
    brand : {
        type:String,
        required:[true,"Brand Must Required!!!"]
    },
    color : {
        type:String,
        required:[true,"Color Must Required!!!"]
    },
    size : {
        type:String,
        required:[true,"Size Must Required!!!"]
    },
    price : {
        type:Number,
        required:[true,"Price Must Required!!!"]
    },
    qty : {
        type:Number,
        default:1
    },
    total : {
        type:Number,
        required:[true,"Total Must Required!!!"]
    },
    pic : {
        type:String
    }
})
const Cart = new mongoose.model("Cart",CartShema)
module.exports = Cart