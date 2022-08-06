var express = require('express');
var router = express.Router();
var User = require("../models/users");
var Article = require("../models/articles");

// home page
router.get('/', function(req, res, next) {
    res.render("homepage");
});

// render register form
router.get("/register", (req, res, next) => {
    // console.log(req.flash("error")[0]);
    res.render("registerForm", { error: req.flash("error")[0] });
});

// posted form to register
router.post("/register", (req, res, next) => {
    User.create(req.body, (err, user) => {
        if (err) {
            if (err.code === 11000) {
                req.flash("error", "This email is already registered!");
                return res.redirect("/users/register");
            }
            if (err.name === "ValidationError") {
                req.flash("error", err.message);
                return res.redirect("/users/register");
            }
            return res.json({ err });
        }
        return res.redirect("/users/login");
    });
});

// login form
router.get("/login", (req, res, next) => {
    return res.render("loginForm", { error: req.flash("error")[0] });
});


//when users logs in
router.post("/login", (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
        req.flash("error", "Email/password required");
        return res.redirect("/users/login");
    }
    if (email) {
        User.findOne({ email }, (err, user) => {
            if (err) return next(err);
            if (user) {
                user.verifyPassword(password, (err, result) => {
                    if (!result) {
                        req.flash("error", "Password is incorrect");
                        return res.redirect("/users/login");
                    }
                    if (result) {
                        req.session.userId = user.id;
                        return res.redirect("/users/articles/new");
                    }
                });
            }
            if (!user) {
                req.flash("error", "Email is not registerd!")
                return res.redirect("/users/login");
            }
        })
    }
})

// user logs in then redirect to articles route
router.get("/articles/new", (req, res, next) => {
    let loggedInUserId = req.session.userId;
    res.render("articleForm", { loggedInUserId });
});


// post article form
router.post("/articles/:userId", (req, res, next) => {
    let userId = req.params.userId;
    Article.create(req.body, (err, article) => {
        if (err) return next(err);
        article.userId = userId;
        User.findByIdAndUpdate(userId, { $push: { articleId: article._id } }, (err, user) => {
            if (err) return next(err);
            return res.redirect("/users/articles/" + `${userId}`);
        });
    });
});

// all articles of a logged in user
router.get("/articles/:userId", (req, res, next) => {
    let userId = req.params.userId;
    User.findById(userId).populate("articleId").exec((err, user) => {
        if (err) return next(err);
        return res.render("listOfArticlesOfSpecificUser", { articles: user.articleId });
    });
});



module.exports = router;