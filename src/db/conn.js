const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Login_Form_1",
    {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
    }, err => {
    if(err) throw err;
    console.log('Connected to MongoDB!!!')
    })