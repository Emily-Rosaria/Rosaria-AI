const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var PokemonSpawnSchema = new Schema({
  id: {type: Number, required: true}, // pokedex ID
  name: {type: String, required: true}, // pokemon name
  escaped: {type: Boolean, required: true}, // whether or not it was caught
  legend: {type: Boolean, required: true}, // whether or not the pokemon was legendary
  shiny: {type: Boolean, required: !this.escaped, default: false},
  source: {type: String, required: true, enum: ["wild","daily","egg","starter","event"], default: "wild"},
  time: {type: Number, default: (new Date()).getTime(), required: true}, // unix time of escape/capture
  guild: {type: String, required: true}, // server ID on discord where it appeared
  catcherID: {type: String, required: !this.escaped} // discord id of user who caught pokemon
});

// Model
var PokemonSpawns = mongoose.model("PokemonSpawns", PokemonSpawnSchema); // Create collection model from schema
module.exports = PokemonSpawns; // export model
