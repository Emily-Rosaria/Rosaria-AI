const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var FledSchema = new Scheme({
  id: Number, // pokedex ID,
  name: String, // pokemon name
  time: {type: Number, default: new Date().getTime()}, // unix time of escape
  server: String // server ID on discord
})

// Model
var FledPokemon = mongoose.model("FledPokemon", FledSchema); // Create collection model from schema
module.exports = FledPokemon; // export model
