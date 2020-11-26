const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var PokemonSpawnSchema = new Scheme({
  id: {type: Number, required: true}, // pokedex ID
  name: {type: String, required: true}, // pokemon name
  legend: {type: Boolean, required: true}, // whether or not the pokemon was legendary
  caught: {type: Boolean, required: true}, // whether or not it was caught
  time: {type: Number, default: new Date().getTime()}, // unix time of escape/capture
  guild: {type: String, required: true} // server ID on discord where it appeared
});

// Model
var PokemonSpawns = mongoose.model("FledPokemon", FledSchema); // Create collection model from schema
module.exports = PokemonSpawns; // export model
