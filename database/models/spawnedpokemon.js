const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var PokemonSpawnSchema = new Scheme({
  id: Number, // pokedex ID
  name: String, // pokemon name
  legend: Boolean, // whether or not the pokemon was legendary
  caught: Boolean, // whether or not it was caught
  time: {type: Number, default: new Date().getTime()}, // unix time of escape/capture
  guild: String // server ID on discord where it appeared
});

// Model
var PokemonSpawns = mongoose.model("FledPokemon", FledSchema); // Create collection model from schema
module.exports = PokemonSpawns; // export model
