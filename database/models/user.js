const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var UserSchema = new Schema({ // Create Schema
    _id: {type: String, required: true}, // ID of user on Discord
    intro: {type: String, default: ""},
    kinks: {type: String, default: ""},
    blacklist: {type: String, default: ""},
    quick_chars: {type: [String], default: []}, // array of message IDs
    characters: {
      type: Map,
      of: mongoose.ObjectId
    } // map of character's they've made sheets for, name mapped to the sheets key
});

// Model
var Users = mongoose.model("Users", UserSchema); // Create collection model from schema
module.exports = Users; // export model
