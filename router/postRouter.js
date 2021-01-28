const express = require("express");
const postRouter = new express.Router();

let {createPost, getPost, getPostByID, patchPost, deletePost} = require("../controller/postController");



// redirects to post controller
postRouter.route("/:post_id").get(getPostByID).patch(patchPost).delete(deletePost);
postRouter.route("/").post(createPost).get(getPost);


module.exports = postRouter;