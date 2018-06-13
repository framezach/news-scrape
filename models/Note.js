let mongoose = require("mongoose");

let Schema = mongoose.Schema;

// Create the Note schema
let NoteSchema = new Schema({
  body: {
    type: String
  }
});

let Note = mongoose.model("Note", NoteSchema);

module.exports = Note;