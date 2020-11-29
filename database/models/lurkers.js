const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var LurkerSchema = new Schema({
  _id: {type: String, required: true}, // discord user ID
  guildID: {type: String, required: true}, // id of guild
  joinedAt: {type: Number, defualt: (new Date()).getTime(), required: true}, // time they joined (ms unix time)
  pings: {type: Number, default: 0, required: true}, // what it does
});

LurkerSchema.virtual('id').get(function() {
  return this._id;
})

// Model
var Lurkers = mongoose.model("Lurkers", LurkerSchema); // Create collection model from schema
module.exports = Lurkers; // export model
