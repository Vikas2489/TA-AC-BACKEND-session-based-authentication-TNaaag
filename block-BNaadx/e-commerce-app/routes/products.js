var express = require("express");
var router = express.Router();
var Admin = require("../models/admin");
var Product = require("../models/products");
var fs = require("fs");
var path = require("path");
var absolutePathOfUploads = path.join(__dirname, "../", "/public/uploads/");

// Edit the product prefilled form
router.get("/:productId/edit", (req, res, next) => {
    let productId = req.params.productId;
    Product.findById(productId, (err, product) => {
        if (err) return next(err);
        return res.render("editProductForm", { product, path: path.join(__dirname, "../") });
    });
});

// post updated form
router.post("/:productId", (req, res, next) => {
    let productId = req.params.productId;
    Product.findByIdAndUpdate(productId, req.body, (err, product) => {
        if (err) return next(err);
        return res.redirect("/admin/products");
    })
});

// delete a product
router.get("/:productId/delete", (req, res, next) => {
    let adminId = req.session.adminId;
    console.log(adminId);
    Product.findByIdAndDelete(req.params.productId, (err, deletedProduct) => {
        if (err) return next(err);
        fs.unlink(path.join(absolutePathOfUploads, deletedProduct.image), (err) => {
            if (err) return next(err);
            return console.log("Deleted Successfully");
        });
        return Admin.findByIdAndUpdate(adminId, { $pull: { product: deletedProduct._id } }, (err, admin) => {
            if (err) return next(err);

            return res.redirect("/admin/products");
        });
    })
});

// get all the products by all admins
router.get("/", (req, res, next) => {
    Product.find({}).populate('adminId').exec((err, productsArr) => {
        if (err) return next(err);
        return res.render("allProducts", { productsArr, userId: req.session.usersId });
    });
});

// like a product by user
router.get("/:productId/like", (req, res, next) => {
    let productId = req.params.productId;
    Product.findByIdAndUpdate(productId, { $inc: { likes: 1 } }, (err, product) => {
        if (err) return next(err);
        return res.redirect("/products");
        alert("product added in cart");
    });
});

// unlike a product by user
router.get("/:productId/unlike", (req, res, next) => {
    let productId = req.params.productId;
    Product.findByIdAndUpdate(productId, { $inc: { likes: -1 } }, (err, product) => {
        if (err) return next(err);
        return res.redirect("/products");
    });
});


module.exports = router;