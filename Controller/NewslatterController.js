const Newslatter = require("../Models/Newslatter")

async function createNewslatter(req, res) {
    try {
        var data = new Newslatter(req.body)
        await data.save()
        res.send({ result: "Done", message: "Thanks to Subscribe Our Newslatter Service\nNow We Will Send Email Regarding News Products and Great Offerse!!!", data: data })
    } catch (error) {
        if (error.keyValue)
            res.send({ result: "Fail", message: "Your Email Id is Already Registered With us!!!" })
        else if (error.errors.email)
            res.send({ result: "Fail", message: error.errors.email.message })
        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error!!!" })
    }
}
async function getAllNewslatter(req, res) {
    try {
        var data = await Newslatter.find().sort({ _id: -1 })
        res.send({ result: "Done", count: data.length, data: data })
    } catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error!!!" })
    }
}
async function deleteNewslatter(req, res) {
    try {
        await Newslatter.deleteOne({ _id: req.params._id })
        res.send({ result: "Done", message:"Record is Deleted!!!" })
    } catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error!!!" })
    }
}
module.exports = [createNewslatter, getAllNewslatter,deleteNewslatter]