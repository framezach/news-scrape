let express = require('express')
let exphbs = require('express-handlebars')
let mongoose = require('mongoose')
let bodyParser = require('body-parser')
let cheerio = require('cheerio')
let request = require('request')

let app = express(); // Initializing Express
let PORT = process.env.PORT || 8090; // Set Default Port for Express and Heroku

app.use(bodyParser.urlencoded({ extended: false })); // Use body-parser for handling form submissions
app.use(bodyParser.json());
app.use(express.static("public"))

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// require("./controllers/webScrapperController.js")(app)

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
app.listen(PORT, ()=>{
    console.log(`App listening on PORT ${PORT}`);
})