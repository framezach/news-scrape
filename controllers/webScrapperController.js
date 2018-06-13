let axios = require('axios');
let cheerio = require('cheerio'); 
let mongoose = require('mongoose'); 
let db = require("../models"); 

mongoose.Promise = Promise; // Set mongoose to leverage Built in JavaScript ES6 Promises

let mongooseConnection = mongoose.connection;

mongooseConnection.on('error', console.error.bind(console, 'connection error:')); // Console error bind: https://www.tjvantoll.com/2015/12/29/console-error-bind/
mongooseConnection.once('open', function() {
  console.log(`Sucessfully Connected to Mongo DB !`); // If Connection is successful, Console.log(Message)
});

module.exports = (app) => { // Export Module Containing Routes. Called from Server.js

// Get Requests / Default Route
  app.get("/", (req, res) => res.render("index"));


  // ---- Let's try this.
  app.get("/api/search", (req, res) => {
      axios.get("https://www.reddit.com/r/news").then(response => {
          let $ = cheerio.load(response.data);

          let handlebarsObject = {
              data: []
          } // Empty object storing cheerio objects.
          $("article".each((i, element) => {
              // User cheerio to search for article HTML tags
            handlebarsObject.data.push({
                title: $(element).children('.top-matter').children('.title').children('a').text(),
                tagline: $(element).children('.top-matter').children('.tagline').children('time').text(),
                url: $(element).children('.top-matter').children('.title').children('a').attr('href'),
                comments: null
            })

          }))       // Return Scrapped Data to Handlebars
          res.render("index", handlebarsObject);
      })
  })
    // Saved Article Route
  app.get("/api/savedArticles", (req, res) => {
    // Grab every document in the Articles collection
    db.Articles.find({}). // Find all Saved Articles
    then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  }); // Default Route

  app.post("/api/add", (req, res) => { // Add Article Route

    // console.log("add path hit");

    let articleObject = req.body;

    db.Articles. // Save the Article to the Database
    findOne({url: articleObject.url}). // Look for an Existing Article with the Same URL
    then(function(response) {

      if (response === null) { // Only Create Article if it has not been Created
        db.Articles.create(articleObject).then((response) => console.log(" ")).catch(err => res.json(err));
      } // End if

      // If we were able to successfully  save an Article, send a message to the client
      res.send("Article Saved");
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

  }); // End Post Route

  // Delete Article Route
  app.post("/api/deleteArticle", (req, res) => {
    // console.log(req.body)
    sessionArticle = req.body;

    db.Articles.findByIdAndRemove(sessionArticle["_id"]). // Look for the Article and Remove from DB
    then(response => {
      if (response) {
        res.send("Sucessfully Deleted");
      }
    });
  }); // End deleteArticle Route

  // Delete Comment Route
  app.post("/api/deleteComment", (req, res) => {
    // console.log("delete comment route hit")
    let comment = req.body;
    db.Notes.findByIdAndRemove(comment["_id"]). // Look for the Comment and Remove from DB
    then(response => {
      if (response) {
        res.send("Sucessfully Deleted");
      }
    });
  }); // End deleteArticle Route

  // Create Notes Route
  app.post("/api/createNotes", (req, res) => {

    sessionArticle = req.body;

    db.Notes.create(sessionArticle.body).then(function(dbNote) {
      // console.log(dbNote);
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Articles.findOneAndUpdate({
        _id: sessionArticle.articleID.articleID
      }, {
        $push: {
          note: dbNote._id
        }
      });
    }).then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    }).catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  }); // End deleteArticle Route

  // Route for grabbing a specific Article by id, populate it with it's note
  app.post("/api/populateNote", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    // console.log("ID is "+ req.body.articleID);

    db.Articles.findOne({_id: req.body.articleID}).populate("Note"). // Associate Notes with the Article ID
    then((response) => {
      // console.log("response is " + response);

      if (response.note.length == 1) { // Note Has 1 Comment

        db.Notes.findOne({'_id': response.note}).then((comment) => {
          comment = [comment];
          console.log("Sending Back One Comment");
          res.json(comment); // Send Comment back to the Client
        });

      } else { // Note Has 0 or more than 1 Comments

        console.log("2")
        db.Notes.find({
          '_id': {
            "$in": response.note
          }
        }).then((comments) => {
          res.json(comments); // Send Comments back to the Client
        });
      }
     
    }).catch(function(err) {
      
      res.json(err);
    });
  }); 

} 