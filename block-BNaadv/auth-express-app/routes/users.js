var express = require('express');
var router = express.Router();
var User = require("../models/users");
var session = require("express-session");

/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render("home");
});


// register form
router.get("/register", (req, res, next) => {
    res.render("registerForm", { error: req.flash("error")[0] });
});

// post register form data
router.post("/register", (req, res, next) => {
    User.create(req.body, (err, user) => {
        if (err) {
            if (err.code === 11000) {
                req.flash("error", "Email is already taken");
                return res.redirect("/users/register");
            }
            if (err.name === "ValidationError") {
                req.flash("error", err.message);
                return res.redirect("/users/register");
            }
            return res.json({ err });
        }
        return res.redirect("/users/login");
    })
});

// login form
router.get("/login", (req, res, next) => {
    res.render("loginForm", { error: req.flash("error")[0] });
});

//  when user logs in
router.post("/login", (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "Email/Password is required");
        return res.redirect("/users/login");
    }
    if (email) {
        User.findOne({ email }, (err, user) => {
            if (err) return next(err);
            if (user === null) {
                req.flash("error", "Email is not registered");
                return res.redirect("/users/login");
            }
            user.verifyPassword(password, (err, result) => {
                if (err) return next(err);
                if (!result) {
                    req.flash("error", "Given password is incorrect");
                    return res.redirect("/users/login");
                }
                if (result) {
                    req.session.userId = user.id;
                    return res.render("dashboard");
                }
            })
        })
    }
});

router.get("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/users/login");
})

module.exports = router;