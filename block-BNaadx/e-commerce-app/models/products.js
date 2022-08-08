var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Admin = require("./admin");

var productSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number },
    image: { type: String },
    likes: { type: Number, default: 0 },
    adminId: { type: Schema.Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

var Product = mongoose.model("Product", productSchema);

module.exports = Product;