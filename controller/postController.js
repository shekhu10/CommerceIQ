const fs = require("fs");
const path = require("path");
let storeDB = require("../model/store");


// ************************************************* private helper functions **************************************


// called by create post to avoid dupicate id and called by get by id
async function find_post(post_id) {

    return new Promise(function (resolve, reject) {
        let ans = storeDB.filter(function (post) {
            return post.id == post_id;
        });
        resolve(ans);
    });
}

// used to update DB
async function updateDB(storeDB) {
    return new Promise(function (resolve, reject) {
        fs.writeFileSync(path.join(__dirname, "../model/store.json"),
            JSON.stringify(storeDB));
        resolve(1);
    });
}


// used to sord on the column in asc or dec order
async function sorting(_sort, _order) {
    return new Promise(function (resolve, reject) {
        let ans;
        if (_order == "asc") {
            ans = storeDB.sort(function (a, b) {
                return a[_sort] - b[_sort];
            });
        }
        else if (_order == "dec") {
            ans = storeDB.sort(function (a, b) {
                return b[_sort] - a[_sort];
            });
        }
        resolve(ans);
    });
}


// get by title and author done
async function getPost_by_title_author(req, res) {
    try {
        let author = req.query.author;
        let title = req.query.title;
        let ans = await storeDB.filter(function (post) {
            return post.title == title && post.author == author;
        })
        if (ans.length == 0) {
            res.status(200).json({
                status: "There is no post with this title published by this author"
            });
        }
        else {
            res.status(200).json({
                status: "Post published by this author is found",
                "result": ans
            })
        }
    }
    catch (err) {
        return res.status(500).json({
            status: "Server error in get post by author and title",
            message: err.message
        })
    }
}




//  private ->    called by get post to get all posts in sorted order 2 param necessary   ->   sort in asc or dec on views or reviews or ids or on any other column of tuple
async function getPostSorted(req, res) {
    try {
        let _order = req.query._order;
        let _sort = req.query._sort;

        let ans = await sorting(_sort, _order);

        res.status(200).json({
            status: "successfully found post id",
            "result": ans
        });
    }
    catch (err) {
        return res.status(500).json({
            status: "failure in get sorting the posts",
            message: err.message
        })
    }
}


//  private -> called by get post to get all posts
async function getAllPost(req, res) {
    try {
        if (storeDB.length == 0) {
            res.status(200).json({
                status: "no post in DB"
            });
        }
        else {
            res.status(200).json({
                status: "found all posts",
                "result": storeDB
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            status: "failure in get",
            message: err.message
        })
    }
}


// private -> called by getPost to filter posts based on 1 query
async function getBy1Query(req, res) {
    try {
        let q = req.query;
        let ob = Object.keys(q);
        let ans = storeDB.filter(function (post) {
            return post[ob] == q[ob];
        });

        res.status(200).json({
            status: "successfully get by 1 query",
            "result": ans
        });


    }
    catch (err) {
        return res.status(500).json({
            status: "failure in get, filter by 1 query",
            message: err.message
        })
    }
}

// for 2 query -> specific query title and author
async function solve_for_2_query(author, title, _sort, _order, req, res) {
    if (title != undefined && author != undefined) {
        return await getPost_by_title_author(req, res);
    }
    else if (_sort != undefined && _order != undefined) {
        return await getPostSorted(req, res);
    }
}





async function patching_post_async(post_id, toUpdate) {

    return new Promise(function (resolve, reject) {
        let post;
        for (let i = 0; i < storeDB.length; i++) {
            if (storeDB[i].id == post_id) {
                post = storeDB[i];
            }
        }

        if (post == undefined) {
            return resolve(post);
        }
        else {
            for (let key in toUpdate) {
                post[key] = toUpdate[key];
            }
            
            fs.writeFileSync(path.join(__dirname, "../model/store.json"),
                JSON.stringify(storeDB));
            resolve(post);
        }


    });

}


// ************************************************* public functions **************************************



// done get post by id
async function getPostByID(req, res) {
    try {
        let post_id = req.params.post_id;
        let post = await find_post(post_id);
        console.log(post);

        if (post.length == 0) {
            return res.status(200).json({
                status: "Incorrect post_id provided...Plz update post id"
            });
        }
        else {
            return res.status(200).json({
                status: "post_id found",
                "result": post
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            status: "failure in get by post id",
            message: err.message
        })
    }
}


// public -> called by post router
async function getPost(req, res) {
    try {
        let q = req.query;
        let size = Object.keys(q).length;
        if (size == 0) {
            return await getAllPost(req, res);
        }
        else if (size == 1) {
            return await getBy1Query(req, res);
        }
        else if (size == 2) {
            let author = req.query.author;
            let title = req.query.title;
            let _sort = req.query._sort;
            let _order = req.query._order;
            return await solve_for_2_query(author, title, _sort, _order, req, res);
        }
    }
    catch (err) {
        return res.status(500).json({
            status: "failure in getPost",
            message: err.message
        })
    }
}


// public -> called by post router
async function createPost(req, res) {
    try {
        let keys = Object.keys(req.body);
        if (keys.length == 0) {
            res.status(400).json({
                status: "failure in creating post",
                message: "send some data to post"
            })
        }
        else {
            let post = req.body;
            let id = post.id;
            if (Number.isInteger(id) == false) {
                return res.status(201).json({
                    status: "Id must be a integer"
                })
            }
            let temp_post = await find_post(id);
            // console.log(temp_post);
            if (temp_post.length > 0) {
                return res.status(201).json({
                    status: "must provide unique numerical id"
                })
            }
            else {
                storeDB.push(post);
                let ans = await updateDB(storeDB);
                res.status(201).json({
                    success: "successful in posting in DB",
                })
            }

        }
    }
    catch (err) {
        return res.status(500).json({
            status: "failure in post",
            message: err.message
        })
    }
}



// public -> called by post router
async function patchPost(req, res) {
    try {
        let { post_id } = req.params;
        let post;
        let toUpdate = req.body;
        if (toUpdate.id != undefined) {
            return res.status(404).json({
                status: "failure",
                message: "id must not be mutated, hence remove id from json data to process"
            })
        }
        else {
            post = await patching_post_async(post_id, toUpdate);

            if (post == undefined) {
                return res.status(200).json({
                    status: "failure",
                    message: "post not found for patch"
                })
            }
            else {
                res.status(200).json({
                    status: "success",
                    message: "patch successful"
                })

            }

        }

    }
    catch (err) {
        return res.status(500).json({
            status: "failure in get",
            message: err.message
        })
    }
}


// public -> called by post router
async function deletePost(req, res) {
    try {
        let { post_id } = req.params;
        let initialstoreDBLength = storeDB.length;
        storeDB = storeDB.filter(function (post) {
            return post.id != post_id;
        });
        if (initialstoreDBLength == storeDB.length) {
            return res.status(404).json({
                status: "failure",
                message: "post not found for delete"
            });
        }
        let ans = await updateDB(storeDB);

        return res.status(200).json({
            status: "success",
            message: "success in deleting"
        })
    }
    catch (err) {
        return res.status(500).json({
            status: "failure in delete",
            message: err.message
        })
    }
}




module.exports.createPost = createPost;
module.exports.getPost = getPost;
module.exports.patchPost = patchPost;
module.exports.deletePost = deletePost;
module.exports.getPostByID = getPostByID;