const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req, res, next)=>{
    try{
        const token = req.cookies.jwt;
        const verfiyUser = jwt.verify(token, process.env.Secret_key);
        console.log(verfiyUser);

        const user = await Register.findOne({_id: verfiyUser._id})
        console.log(user.name);
        next();

    }catch(e){
        console.log("error is"+e);
        res.status(401).send(e);
    }
}

module.exports = auth;