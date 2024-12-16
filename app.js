const express = require("express");
const app = express();
const PORT = 8080;
const {sequelize} = require("./models");


app.set("view engine", "ejs");
app.use(express.urlencoded({extended:false}));
app.use(express.json());

const indexRouter = require("./routes");
app.use('/', indexRouter);


sequelize.sync({force: false})
.then(()=>{
    app.listen(PORT, ()=>{
        console.log(`http://localhost:${PORT}`);
    });  
}).catch((err)=>{
    console.log("db connecion err!");
    console.log(err);
})