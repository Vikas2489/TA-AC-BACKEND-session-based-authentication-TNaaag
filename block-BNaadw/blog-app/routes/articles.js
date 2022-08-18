var express = require("express");
var router = express.Router();
var Article = require("../models/articles");
var Comment = require("../models/comments");


router.get("/:title", (req, res, next) => {
    let title = req.params.title;
    Article.findOne({ slug: title }).populate("comments").exec((err, article) => {
        if (err) return next(err);
        return res.render("singleArticleDetail", { article });
    });
});


router.post("/:title", (req, res, next) => {
    let title = req.params.title;
    Article.findOne({ slug: title }, (err, article) => {
        if (err) return next(err);
        article.title = req.body.title;
        article.description = req.body.description;
        article.author = req.body.author;
        article.save((err, article) => {
            if (err) return next(err);
            return res.redirect("/articles/" + `${article.slug}`);
        });
    })
});

// edit the article (get pre filled form of article)
router.get("/:title/edit", (req, res, next) => {
    let title = req.params.title;
    Article.findOne({ slug: title }, (err, article) => {
        if (err) return next(err);
        res.render("updateArticleForm", { article });
    });
});

// increment like 
router.get("/:title/likes", (req, res, next) => {
    let title = req.params.title;
    Article.findOneAndUpdate({ slug: title }, { $inc: { likes: 1 } }, (err, article) => {
        if (err) return next(err);
        res.redirect("/articles/" + `${article.slug}`);
    });
});

// create a comment
router.post("/:articleId/comment", (req, res, next) => {
    let articleId = req.params.articleId;
    req.body.articleId = articleId;
    Comment.create(req.body, (err, comment) => {
        if (err) return next(err);
        Article.findByIdAndUpdate(articleId, { $push: { comments: comment.id } }, (err, article) => {
            if (err) return next(err);
            res.redirect("/articles/" + `${article.slug}`);
        });
    });
})

// like the comment
router.get("/:commentId/comments/like", (req, res, next) => {
    let commentId = req.params.commentId;
    Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } }, (err, comment) => {
        if (err) return next(err);
        Comment.findById(commentId).populate("articleId").exec((err, comment) => {
            if (err) return next(err);
            res.redirect("/articles/" + `${comment.articleId.slug}`);
        });
    });
});

// delete a comment
router.get("/:commentId/comments/delete", (req, res, next) => {
    let commentId = req.params.commentId;
    Comment.findByIdAndDelete(commentId, (err, deletedComment) => {
        if (err) return next(err);
        Article.findByIdAndUpdate(deletedComment.articleId, { $pull: { comments: commentId } }, (err, article) => {
            if (err) return next(err);
            res.redirect("/articles/" + `${article.slug}`);
        });
    })
})

// get form to edit ur comment
router.get("/:commentId/comments/edit", (req, res, next) => {
    let commentId = req.params.commentId;
    Comment.findById(commentId, (err, comments) => {
        if (err) return next(err);
        return res.render("commentForm.ejs", { comments });
    })
});

// post to edit form
router.post("/:commentId/comments", (req, res, next) => {
    let commentId = req.params.commentId;
    Comment.findByIdAndUpdate(commentId, req.body, (err, updatedComment) => {
        if (err) return next(err);
        Article.findById(updatedComment.articleId, (err, article) => {
            if (err) return next(err);
            res.redirect("/articles/" + `${article.slug}`);
        });
    })
})

module.exports = router;