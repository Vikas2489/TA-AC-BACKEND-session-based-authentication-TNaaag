var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");
var Product = require("./products");

var adminSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    age: { type: Number, default: 18 },
    city: { type: String },
    password: { type: String, required: true, minlength: 5 },
    product: [{ type: Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });

adminSchema.pre("save", function(next) {
    if (this.password && this.isModified('password')) {
        bcrypt.hash(this.password, 10, (err, hashed) => {
            if (err) return next(err);
            this.password = hashed;
            return next();
        })
    } else {
        return next();
    }
});

adminSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result);
    })
}

var Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;