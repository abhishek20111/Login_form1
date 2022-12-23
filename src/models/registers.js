const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const employee = new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
    },
    date:{
        type: String,
    },
    code:{
        type: String
    },
    password:{
        type: String,
        require: true
    },
    confirmPassword:{
        type: String,
        require: true
    },
    token:[{
        token:{
            type:String,
            require:true,
        }
    }]
    
})

employee.methods.generateAuthToken = async function(){
    try{
        console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()}, process.env.Secret_key);
        this.token = this.token.concat({token:token});
        await this.save();
        // console.log("the token is "+token);
        return token;

    }catch(error){
        console.log("this is"+error);
    }
}


//this is to add bycrpt in it , it act as middleware
employee.pre("save", async function(next){ // this pre say do this function before save command
    if(this.isModified("password")){
        //this.password = give value of password
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmPassword = this.password;
    }
    next();
})

const Register = new mongoose.model("register", employee);
module.exports = Register;