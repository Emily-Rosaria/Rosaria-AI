const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Create Schema
var UserSchema = new Schema({
    _id: {type: String, required: true}, // ID of user on Discord
    name: {type: String, default: ""},
    intro: {type: String, default: ""},
    kinks: {type: String, default: ""},
    blacklist: {type: String, default: ""},
    bot: {type: Boolean, default: false},
    wordcounts: {
      type: Map,  // key-value pairs of a string (word/phrase)
      of: Number // and a number (how many times it's said)
    },
    quick_chars: {type: [String], default: []}, // array of message IDs
    characters: {
      type: Map,
      of: String // map of character's they've made sheets for, name mapped to the sheets key (which defaults to the ID of the discord message that created the character)
    },
    documents: {
      type: Map,  // key-value pairs of a string (that invokes the command)
      of: String // and a string "ID", the _id of the document and the id of the discord message that created it
    },
    xp: {type: Number, default: 0},
    gold: {type: Number, default: 0},
    daily: {type: Number, default: 0}, // last daily gold bonus (timestamp)
    bumps: {type: Number, default: 0},
    totalWords: {type: Number, default: 0}, // total words written by this users
    totalChars: {type: Number, default: 0} // character count - as in total letters written by this user
});

// Model
var Users = mongoose.model("Users", UserSchema); // Create collection model from schema
module.exports = Users; // export model
