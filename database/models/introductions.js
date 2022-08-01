const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var IntroductionSchema = new Schema({
  _id: {type: String, required: true}, // ID of the message that was posted
  author: {type: String, required: true}, // ID of the author that posted the message
  timestamp: {type: String, required: true}, // timestamp of the message in unix ms
  content: {type: String, required: true} // text content of the intro
});

// Model
var introductions = mongoose.model("Introductions", IntroductionSchema); // Create collection model from schema
module.exports = introductions; // export model
