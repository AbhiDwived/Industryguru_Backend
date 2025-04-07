const mongoose = require("mongoose")

const NewslatterShema = new mongoose.Schema({
    email : {
        type:String,
        required:[true,"Email Must Required!!!"],
        unique:true
    }
})
const Newslatter = new mongoose.model("Newslatter",NewslatterShema)
module.exports = Newslatter