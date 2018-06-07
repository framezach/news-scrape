let mongoose = require('mongoose');

let Schema = mongoose.Schema; // Save a Reference

let ArticleSchema = new Schema({ // Create a New Schema Constructor for News Article

  headline: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  imageURL: {
    type: String,
    required: true
  },

  slug: {
    type: String
  },

  // `comments` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Comment
  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]

})

// This creates our model from the above schema, using mongoose's model method
let Article = mongoose.model("Article", ArticleSchema);

module.exports = Article