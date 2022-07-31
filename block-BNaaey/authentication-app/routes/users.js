var express = require('express');
var router = express.Router();
var User = require("../models/users");


/* GET users listing. */
router.get('/register', function(req, res, next) {
    console.log(req.session);
    res.render('userForm');
});

// register a login
router.post("/register", (req, res, next) => {
    User.create(req.body, (err, user) => {
        if (err) return next(err);
        return res.redirect("/users/login");
    });
});


// render login form
router.get("/login", (req, res, next) => {
    res.render("loginForm");
})


// loging in user
router.post("/login", (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
        return res.redirect("/users/register");
    }
    User.findOne({ email }, (err, user) => {
        if (err) return next(err);
        if (!user) {
            return res.redirect("/users/register");
        }
        user.verifyPassword(password, (err, result) => {
            if (err) return next(err);
            if (result) {
                // if result === true; will create session
                req.session.userId = user.id;
                return res.render("dashboard", { user });
            } else {
                return res.redirect("/users/login");
            }
        })
    })
})

module.exports = router;