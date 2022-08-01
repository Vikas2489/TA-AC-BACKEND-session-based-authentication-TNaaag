var express = require('express');
var router = express.Router();
var User = require("../models/users");


/* GET users listing. */
router.get('/register', function(req, res, next) {
    console.log(req.session);
    let error = req.flash("error")[0];
    let password_error = req.flash("password_err")[0];
    let email_not_registered = req.flash("email_not_registered")[0];
    res.render('userForm', { error, password_error, email_not_registered });
});

// register a login
router.post("/register", (req, res, next) => {
    // Mine way of handling flash message (considered not an optimal way in a longer run)

    // let { email, password } = req.body;
    // User.distinct("email", (err, allEmail) => {
    //     if (err) return next(err);
    //     if (allEmail.includes(email)) {
    //         req.flash("error", "email already exists!");
    //         res.redirect("/users/register");
    //     } else if (password.length < 4) {
    //         req.flash("password_err", "password should be greater than 4 characters");
    //         res.redirect("/users/register");
    //     } else {
    //         User.create(req.body, (err, user) => {
    //             if (err) return next(err);
    //             res.redirect("/users/login");
    //         })
    //     }
    // })

    User.create(req.body, (err, user) => {
        if (err) {
            if (err.code === 11000) {
                req.flash("error", "email already exists!");
                return res.redirect("/users/register");
            }
            if (err.name === "ValidationError") {
                req.flash("password_err", err.message);
                return res.redirect("/users/register");
            }
            return res.json({ err });
        }
        return res.redirect("/users/login");
    })

});


// render login form
router.get("/login", (req, res, next) => {
    let wrong_password = req.flash("wrong_password")[0];
    let email_password = req.flash("email_password")[0];
    res.render("loginForm", { wrong_password, email_password });
})


// loging in user
router.post("/login", (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
        req.flash("email_password", "email/password is required");
        return res.redirect("/users/login");
    }
    User.findOne({ email }, (err, user) => {
        if (err) return next(err);
        if (!user) {
            req.flash("email_not_registered", "This email is not registered!   Go on Register now");
            return res.redirect("/users/register");
        }
        user.verifyPassword(password, (err, result) => {
            if (err) return next(err);
            if (result) {
                req.session.userId = user.id;
                return res.render("dashboard");
            } else {
                req.flash("wrong_password", "Password is incorrect");
                return res.redirect("/users/login");
            }
        })
    })
});


router.get("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/users/login");
})



module.exports = router;