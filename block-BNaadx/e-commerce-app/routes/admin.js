var express = require("express");
var router = express.Router();
var Admin = require("../models/admin");
const Product = require("../models/products");
var path = require("path");

// multer
var multer = require("multer");

var uploadsPath = path.join(__dirname, "../", "/public/uploads/");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsPath);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage: storage });

// post product form
router.post("/products", upload.single("image"), (req, res, next) => {
    req.body.image = req.file.filename;
    req.body.adminId = req.session.adminId;
    Product.create(req.body, (err, product) => {
        if (err) return next(err);
        Admin.findByIdAndUpdate(req.session.adminId, { $push: { product: product.id } }, (err, admin) => {
            if (err) return next(err);
            return res.redirect("/admin/products");
        });
    });
});

// get all by products by one specific admin
router.get("/products", (req, res, next) => {
    let adminId = req.session.adminId;
    Admin.findById(adminId).populate('product').exec((err, admin) => {
        if (err) return next(err);
        return res.render("productsBySpecificAdmin", { products: admin.product });
    });
});

// admin register form
router.get("/new", (req, res, next) => {
    return res.render("adminRegister", { error: req.flash("error")[0] });
});

// create admin
router.post("/", (req, res, next) => {
    Admin.create(req.body, (err, admin) => {
        if (err) {
            if (err.code === 11000) {
                req.flash("error", "Email is already registered!");
                return res.redirect("/admin/new");
            }
            if (err.name === "ValidationError") {
                req.flash("error", "Password is Short, less than 5");
                return res.redirect("/admin/new");
            }
            return res.json({ err });
        } else {
            console.log(admin);
            return res.redirect("/admin/login");
        }
    })
});

// login Form
router.get("/login", (req, res, next) => {
    return res.render("adminLoginForm", { error: req.flash("error")[0] });
})

// post login form
router.post("/login", (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "Email/Password is required");
        return res.redirect('/admin/login');
    }
    if (email) {
        Admin.findOne({ email }, (err, admin) => {
            if (err) {
                return next(err);
            }
            if (!admin) {
                req.flash("error", "Email is not registered");
                return res.redirect("/admin/login");
            }
            if (admin) {
                admin.verifyPassword(password, (err, result) => {
                    if (err) return next(err);
                    if (!result) {
                        req.flash("error", "Password is incorrect");
                        return res.redirect("/admin/login");
                    }
                    if (result) {
                        req.session.adminId = admin.id;
                        res.redirect("/admin/products/new");
                    }
                })
            }
        });
    }
});

// show product form
router.get("/products/new", (req, res, next) => {
    return res.render("productForm");
});

// logout as admin
router.get("/logout", (req, res, next) => {
    req.session.destroy();
    return res.redirect("/admin/login");
});


module.exports = router;