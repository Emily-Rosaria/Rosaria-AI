const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var SpriteScheme = new Schema({
  normal: String, // e.g. X.png
  shiny: String // e.g. shiny/X.png
});

var AbilityScheme = new Schema({
  name: String, // Ability name
  hidden: Boolean // if the ability is hidden, or whatevs. usually false
});

var StatsScheme = new Schema({
  hp: Number,
  attack: Number,
  defense: Number,
  special-attack: Number,
  special-defense: Number,
  speed: Number
});

var WildPokemonSchema = new Schema({
    id: Number, //pokedex Number
    name: String, // species name
    img: String, // e.g.  other/official-artwork/X.png
    sprites: SpriteScheme,
    types: [String], // e.g. ["grass","fighting"]
    abilities: [AbilityScheme],// ability list
    height: [Number], // height in metres
    weight: [Number], // weight in kg
    stats: StatsScheme, // base stats
    rarity: Number, // inverse of weighting, default is 1
    legend: Boolean // if the pokemon is "legendary"
});

var WildPokemon = mongoose.model("Trainers", WildPokemon); // Create collection model from schema

modules.exports = WildPokemon;
