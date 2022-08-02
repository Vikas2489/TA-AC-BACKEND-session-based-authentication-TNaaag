var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /@/ },
    password: { type: String, required: true, minlength: 5 },
}, { timestamps: true });

userSchema.pre("save", function(next) {
    if (this.password && this.isModified("password")) {
        bcrypt.hash(this.password, 10, (err, hash) => {
            if (err) return next(err);
            this.password = hash;
            console.log(this, "after hashing");
            return next();
        })
    } else {
        return next();
    }
});


userSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        console.log(this.password);
        return cb(err, result);
    })
}

var User = mongoose.model("User", userSchema);

module.exports = User;