const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Character messages are all posted in the 728297407976177816 (character-reference) channel

// Schema
var CharacterSchema = new Schema({ // Create Schema
    _id: {type: String, required: true}, // ID of the character message
    author: {type: String, required: true}, // ID of character owner on Discord
    name: {type: String, required: true}, // name of the character
    nicknames: {type: [String], default: []},
    age: {type: String, default: ""},
    pronouns: {type: String, default: ""}, // pronouns, e.g. "she/her/her", "he/him/his", "they/them/their"
    gender: {type: String, default: ""},
    sexuality: {type: String, default: ""},
    role: {type: String, default: ""},
    appearance: {type: String, default: ""},
    personality: {type: String, default: ""},
    kinks: {type: String, default: ""},
    blacklist: {type: String, default: ""},
    backstory: {type: String, default: ""},
    image_main: {type: String, default: ""}, // url of main character image
    image_1: {type: String, default: ""},
    caption_1: {type: String, default: ""}, // caption of extra image 1
    image_2: {type: String, default: ""},
    caption_2: {type: String, default: ""} // caption of extra image 2
});

// Model
var Characters = mongoose.model("Characters", CharacterSchema); // Create collection model from schema
module.exports = Characters; // export model
