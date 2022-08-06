let mongoose = require("mongoose");
let Schema = mongoose.Schema;
var slugger = require("slugger");
var User = require("./users");
var Comment = require("./comments");

var articleSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    author: { type: String, required: true },
    slug: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
})

articleSchema.pre("save", function(next) {
    if (this.title && this.isModified("title")) {
        this.slug = slugger(this.title);
        return next();
    } else {
        return next();
    }
});

var Article = mongoose.model("Article", articleSchema);

module.exports = Article;