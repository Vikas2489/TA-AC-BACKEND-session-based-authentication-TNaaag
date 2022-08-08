var express = require("express");
const Admin = require("../models/admin");
var router = express.Router();
var Product = require("../models/products");
var User = require("../models/users");

// get register form
router.get("/new", (req, res, next) => {
    return res.render("userRegisterForm", { error: req.flash("error")[0] });
});

// post the register form
router.post("/", (req, res, next) => {
    User.create(req.body, (err, user) => {
        if (err) {
            if (err.code === 11000) {
                req.flash("error", "Email is already registered!");
                return res.redirect("/users/new");
            }
            if (err.name === "ValidationError") {
                req.flash("error", "Password is Short, less than 5");
                return res.redirect("/users/new");
            }
            return res.json({ err });
        } else {
            return res.redirect("/users/login");
        }
    });
});

// get login form
router.get("/login", (req, res, next) => {
    return res.render("userLoginForm", { error: req.flash("error")[0] });
});

// post login form
router.post("/login", (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "Email/Password is required");
        return res.redirect('/users/login');
    }
    if (email) {
        User.findOne({ email }, (err, users) => {
            if (err) {
                return next(err);
            }
            if (!users) {
                req.flash("error", "Email is not registered");
                return res.redirect("/users/login");
            }
            if (users) {
                users.verifyPassword(password, (err, result) => {
                    if (err) return next(err);
                    if (!result) {
                        req.flash("error", "Password is incorrect");
                        return res.redirect("/users/login");
                    }
                    if (result) {
                        req.session.usersId = users.id;
                        return res.redirect("/products");
                    }
                })
            }
        });
    }
});

// add to cart
router.get("/:productId/cart", (req, res, next) => {
    let productId = req.params.productId;
    User.findByIdAndUpdate(req.session.usersId, { $push: { cart: productId } }, (err, user) => {
        if (err) return next(err);
        console.log(user);
        return res.redirect("/products");
    });
});

// logout
router.get("/:userId/logout", (req, res, next) => {
    req.session.destroy();
    return res.redirect("/admin/login");
});





module.exports = router;