const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var CurrencySchema = new Schema({
  _id: {type: String, required: true}, // currency ID (e.g. tokens, coins, gold, etc.)
  description: {type: String, required: true}, // what it's for
  emote: {type: String, required: true}, //unicode, emote string, etc.
  emoteGuild: {type: String, default: ""} // ID of discord guild with the emote (if it's a custom emote)
});

CurrencySchema.virtual('id').get(function() {
  return this._id;
})

// Model
var Currencies = mongoose.model("Currencies", CurrencySchema); // Create collection model from schema
module.exports = Currencies; // export model
