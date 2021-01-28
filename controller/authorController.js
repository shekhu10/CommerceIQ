const fs = require("fs");
const path = require("path");
let authorDB = require("../model/author");


// ************************************************* private helper functions **************************************


// used by putAuthor
async function search(author_id) {
    return new Promise(function (resolve, reject) {
        let author;
        for (let i = 0; i < authorDB.length; i++) {      
            if (authorDB[i].id == author_id) {
                author = authorDB[i];
                break;
            }
        }
        resolve(author);
    })
}


// used by putAuthor
async function updateDB(authorDB) {
    return new Promise(function (resolve, reject) {
        fs.writeFileSync(path.join(__dirname, "../model/author.json"),
            JSON.stringify(authorDB));
        resolve(1);
    });
}



// ************************************************* public functions **************************************

async function putAuthor(req, res) {
    try {
        
        let author_id = req.params.author_id;
        let toUpdate = req.body;
        let author = await search(author_id);

        if (author == undefined) {
            authorDB.push(toUpdate);
            let ans = await updateDB(authorDB);
            
            res.status(200).json({
                status: "success",
                message: "put post record successful"
            })
        }
        else {
            for (let key in toUpdate) {
                author[key] = toUpdate[key];
            }
            
            let ans = await updateDB(authorDB);
            res.status(200).json({
                status: "success",
                message: "put update record successful"
            })
        }

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "failure in put",
            message: err.message
        })
    }
}


module.exports.putAuthor = putAuthor;