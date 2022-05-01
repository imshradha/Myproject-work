const jwt = require('jsonwebtoken');
const authorModel = require('../Model/authorModel');

const authentication = async function (req, res, next) {
    try {
        //Validate Author
        let authorId = req.headers["authorid"]
        if(!authorId) {
            return res.status(404).send({status:false, msg:"Author Id is not Present"})
        }
        let author = await authorModel.findById({_id:authorId})
        if(!author) {
            return res.status(404).send({status:false, msg:"Author does not exist"})
        }
        
        //Reading credential
        let username = author.email
        let password = author.password
        
        //Reading token
        let token = req.headers["x-Api-Key"];
        //check lowercase
        if (!token) token = req.headers["x-api-key"]

        //if token not found
        if (!token) {
            return res.status(404).send({ status: false, msg: "Token must be present" })
        }

        //if token found
        let decode = jwt.verify(token, "group40-phase2");
        //if token is not valid
        if (!decode) {
            return res.status(403).send({ status: false, msg: "Invalid Token" })
        }

        //Reading authorId from decoded token
        const authenticAuthorId = decode.authorId
        //finding author with authorid from decoded token
        const authenticAuthor = await authorModel.findById({ _id: authenticAuthorId })
        //if no author found  
        if (!authenticAuthor) {
            return res.status(400).send({ status: false, msg: "Author does not exist" });
        }

        //if login credential combination do not match with  decoded tokens author
        if (username != authenticAuthor.email || password != authenticAuthor.password) {
            return res.status(400).send({ status: false, msg: "Authentication failed" });
        }

        //if login credential match move to next function
        next()

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });

    }
}

//export function
module.exports.authentication = authentication