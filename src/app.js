require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const bcrypt = require("bcryptjs")
const hbs = require("hbs");
require("./db/conn");
const Register = require("./models/registers.js");
const { log } = require('console');
const cookie_Parser = require("cookie-parser")
const auth = require("./middleware/auth");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../template/views");
const partials_path = path.join(__dirname, "../template/partials");

app.use(express.json()) 
app.use(cookie_Parser);
app.use(express.urlencoded({extended: false}))

app.use(express.static(static_path))
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("/",(req, res)=>{
    res.render("index")
});

app.get("/secret", auth, (req, res)=>{
    console.log(`This is the cookie ${req.cookies.jwt}`);
    res.render("secret")
});

app.get("/logout",auth, async (req, res)=>{
    try{

        //for single logout
        req.user.token = req.user.token.filter((currentElement)=>{ // this filter is do delete that particular token from database when logout 
            return currentElement.token !== req.token;
        })

        //for all device logout
        req.use.token=[];

        res.clearCookie("jwt");//clear cokkie name jwt
        console.log("log out");
        await req.user.save();//it mean after removal of cookie save the changes
        res.send("login");//after logout send login page 
    }catch(error){
        res.status(500).send(error);
    }
});

app.get("/register",(req, res)=>{
    res.render("register")
});

app.get("/login",(req, res)=>{
    res.render("login")
});


app.post("/register",async (req, res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirm_password;
        if(password === cpassword){
            const register_employee = new Register({
    
                name : req.body.name,
                email : req.body.email,
                date : req.body.date,
                code : req.body.code,
                password : req.body.password,
                confirmPassword : req.body.confirm_password,
    
            })

            const token = await register_employee.generateAuthToken();
            console.log("complete "+token);

            res.cookie("jwt",token,{//Creating cookie also give expire time and http to ensure that client side cant delete our cookie
                expires: new Date(Date.now()+300000),
                httpOnly: true
            });

            //for check cookie store value
            console.log(`it is ${req.cookies.jwt} is a cookie`);
            

            const Register_done = await register_employee.save();
            console.log("data paste in db");
            res.status(201).render("index");
        }else{
            console.log("not added deatils1");
            res.send("Invalid details");
        }
    }catch(e){
        console.log(`gone in catch error is ${e} `);
        res.status(400).send(e);}
});

app.post("/login", async(req, res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const username = await Register.findOne({email: email});
        const isMatch_password = await bcrypt.compare(password, username.password);

        const token = await username.generateAuthToken();
        console.log("the token is"+token);

        res.cookie("jwt", token,{
            expires: new Date(Date.now()+500000),
            httpOnly: true,
            // secure:true
        })

        if(isMatch_password){
            res.status(201).render("index");
        }
        else{
            res.send("Invalid Login Details");
        }

    }catch(e){
        res.status(400).send(e);
    }
})

app.listen(port, ()=>{
    console.log(`connect to port no-${port}`);
});