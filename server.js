let express = require('express')
let mongoose = require('mongoose')
let bodyParser = require('body-parser')
let cheerio = require('cheerio')
let request = require('request')
let morgan = require('morgan')
let Article = require("./models/Articles.js")
let Note = require("./models/Note.js")
var exphbs = require("express-handlebars");


let app = express(); // Initializing Express
let PORT = process.env.PORT || 8500; // Set Default Port for Express and Heroku

app.use(bodyParser.urlencoded({ extended: false })); // Use body-parser for handling form submissions
app.use(bodyParser.json());
app.use(express.static("public")) // Serve static content

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var routes = require("./controllers/webScrapperController.js");

app.use("/", routes);

mongoose.connect("mongodb://framez:vj4cxex6@ds151840.mlab.com:51840/heroku_fc4njqbp");
db = mongoose.connection;
db.on("error", function(error){
    console.log("Mongoose Error: ", error)
})

db.once("open", function(){
    console.log("Mongoose Connection Successful!!!")
})

app.listen(PORT, ()=>{
    console.log(`App listening on PORT ${PORT}`);
})