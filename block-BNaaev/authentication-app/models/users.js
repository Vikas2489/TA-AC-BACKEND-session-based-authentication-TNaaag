var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var bcrypt = require("bcrypt");

var userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    phone: { type: Number, required: true },
}, { timestamps: true });

userSchema.pre('save', function(next) {
    console.log(this.password);
    if (this.password && this.isModified('password')) {
        bcrypt.hash(this.password, 10, (err, hashed) => {
            if (err) return next(err);
            this.password = hashed;
            return next();
        })
    } else {
        return next();
    }
})

var User = mongoose.model("User", userSchema);

module.exports = User;