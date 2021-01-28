const express = require("express");
const authorRouter = new express.Router();

let { putAuthor } = require("../controller/authorController");



// direct to author controller
authorRouter.put("/:author_id", putAuthor);



module.exports = authorRouter;