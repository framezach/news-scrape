let axios = require('axios')
let express = require('express')
let router = express.Router()
let request = require('request')
let cheerio = require('cheerio')
let mongoose = require('mongoose')

mongoose.Promise = Promise; // Set mongoose to leverage Built in JavaScript ES6 Promises

let Note = require("../models/Note.js");
let Article = require("../models/Articles.js");


router.get("/", (req, res) => res.render("index"));

// This will get the articles scraped and saved in db and show them in list.
router.get("/savedarticles",(req, res) => {

  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      let hbsArticleObject = {
        articles: doc
      };

      res.render("savedarticles", hbsArticleObject);
    }
  });
});
// ============================================================
// A GET request to scrape the echojs website
router.post("/scrape", function(req, res) {

  // First, we grab the body of the html with request
  request("https://reddit.com/r/news", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    let $ = cheerio.load(html);

    // Make emptry array for temporarily saving and showing scraped Articles.
    let scrapedArticles = {};
    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {

      // Save an empty result object
      let result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children(".top-matter").children('.title').children('a').text();
      result.tagline = $(this).children('.top-matter').children('.tagline').children('time').text()
      result.link = $(this).children(".top-matter").children('.title').children('a').attr('href');

      scrapedArticles[i] = result;

    });

    let hbsArticleObject = {
        articles: scrapedArticles
    };

    res.render("index", hbsArticleObject);

  });
});

router.post("/save", function(req, res) {

  let newArticleObject = {};

  newArticleObject.title = req.body.title;
  newArticleObject.tagline = req.body.tagline;
  newArticleObject.link = req.body.link;

  let entry = new Article(newArticleObject);

  entry.save(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(doc);
    }
  });

  res.redirect("/savedarticles");

});

router.get("/delete/:id", function(req, res) {

  Article.findOneAndRemove({"_id": req.params.id}, function (err, offer) {
    if (err) {
      console.log("Error" + err);
    } else {
      console.log("Succesfully deleted");
    }
    res.redirect("/savedarticles");
  });
});

router.get("/notes/:id", function(req, res) {

  Note.findOneAndRemove({"_id": req.params.id}, function (err, doc) {
    if (err) {
      console.log("Unable to Delete" + err);
    } else {
      console.log("Deleted");
    }
    res.send(doc);
  });
});

router.get("/articles/:id", function(req, res) {

  Article.findOne({"_id": req.params.id})

  .populate('notes')

  .exec(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(doc);
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note
router.post("/articles/:id", function(req, res) {

  // Create a new note and pass the req.body to the entry
  let newNote = new Note(req.body);
  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    } 
    else {
      // Use the article id to find it and then push note
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {notes: doc._id}}, {new: true, upsert: true})

      .populate('notes')

      .exec(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
          res.send(doc);
        }
      });
    }
  });
});
// Export routes for server.js to use.
module.exports = router;