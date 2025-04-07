const Wishlist = require("../Models/Wishlist")

async function createWishlist(req, res) {
    try {
        var data = new Wishlist(req.body)
        await data.save()
        res.send({ result: "Done", message: "Record is Created!!!", data: data })
    } catch (error) {
        if (error.errors.userid)
            res.send({ result: "Fail", message: error.errors.userid.message })
        else if (error.errors.productid)
            res.send({ result: "Fail", message: error.errors.productid.message })
        else if (error.errors.name)
            res.send({ result: "Fail", message: error.errors.name.message })
        else if (error.errors.brand)
            res.send({ result: "Fail", message: error.errors.brand.message })
        else if (error.errors.color)
            res.send({ result: "Fail", message: error.errors.color.message })
        else if (error.errors.size)
            res.send({ result: "Fail", message: error.errors.size.message })
        else if (error.errors.price)
            res.send({ result: "Fail", message: error.errors.price.message })
        else
            res.status(500).send({ result: "Fail", message: "Internal Server Error!!!" })
    }
}
async function getAllWishlist(req, res) {
    try {
        var data = await Wishlist.find({userid:req.params.userid}).sort({ _id: -1 })
        res.send({ result: "Done", count: data.length, data: data })
    } catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error!!!" })
    }
}
async function deleteWishlist(req, res) {
    try {
        await Wishlist.deleteOne({ _id: req.params._id })
        res.send({ result: "Done", message: "Record is Deleted!!!" })
    } catch (error) {
        res.status(500).send({ result: "Fail", message: "Internal Server Error!!!" })
    }
}
module.exports = [createWishlist, getAllWishlist, deleteWishlist]