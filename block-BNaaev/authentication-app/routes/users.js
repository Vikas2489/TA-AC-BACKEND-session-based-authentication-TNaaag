var express = require('express');
var router = express.Router();
var User = require("../models/users");

/* GET users listing. */
router.get('/register', function(req, res, next) {
    res.render('userForm');
});


router.post("/register", (req, res, next) => {
    User.create(req.body, (err, user) => {
        if (err) return next(err);
        console.log(user);
        res.send("user Created");
    })
})

module.exports = router;