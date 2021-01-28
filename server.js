const express = require("express");
const app = express();
const authorRouter = require("./router/authorRouter");
const postRouter = require("./router/postRouter");




app.use(express.json());

// default
app.use(express.static("view"));

// direct to router
app.use("/authors", authorRouter);
app.use("/posts", postRouter);



// listen server at 3000
app.listen(3000, function () {
    console.log("server is starting at port 3000")
});
