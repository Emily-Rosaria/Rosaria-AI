const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var UserSchema = new Schema({ // Create Schema
    _id: {type: String, required: true}, // ID of user on Discord
    name: {type: String, default: ""},
    intro: {type: String, default: ""},
    kinks: {type: String, default: ""},
    blacklist: {type: String, default: ""},
    quick_chars: {type: [String], default: []}, // array of message IDs
    characters: {
      type: Map,
      of: String // map of character's they've made sheets for, name mapped to the sheets key (which defaults to the ID of the discord message that created the character)
    },
    documents: {
      type: Map,  // key-value pairs of a string (that invokes the command)
      of: String // and a string "ID", the _id of the document and the id of the discord message that created it
    }
});

// Model
var Users = mongoose.model("Users", UserSchema); // Create collection model from schema
module.exports = Users; // export model
