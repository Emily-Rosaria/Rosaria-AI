const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var TrainerPokemonSchema = new Schema({
    id: Number, //pokedex Number
    name: String, // species name
    gender: String, // male/female
    nickname: {type: String, default: this.name}, //User-set name. Defaults to the pokemon's species name
    friendship: {type: Number, default: 50},
    captureDate: {type: Number, default: new Date().getTime()}, // unix time of capture
    legend: {type: Boolean, default: false},
    shiny: {type: Boolean, default: false},
    party: {type: Boolean, default: false}
});

var EggsSchema = new Schema({
    id: Number, //pokedex Numbers of the pokemon it could be
    dateObtained: {type: Number, default: new Date().getTime()}, // unix time of capture
    inclubating: {type: Boolean, default: false}, // if the egg is being incubated
    startedIncubating: {type: Number, default: -1} // when incubation began, unix time, -1 if never started
});

var TrainersSchema = new Schema({ // Create Schema
    id: String, // ID of user on Discord
    tokens: {type: Number, default: 0}, // Number of tokens, for use with the bot in shops and such
    pokeballs: {type: Number, default: 0}, // Number of extra pokeballs to allow for catches while on cooldown
    lastcatch: {type: Number, default: 0}, // unix time of last catch
    lastdaily: {type: Number, default: 0}, // unix time of last daily
    nickname: {type: String, default: ""},  // User set trainer-based alias.
    tagline: {type: String, default: ""}, // Trainer quote.
    registrationDate: {type: Number, default: new Date().getTime()}, // unix time of signup/first catch
    pokemon: {type: [TrainerPokemonSchema], default: []}, //array of all their pokemon
    eggs: {type: [EggsSchema], default: []}
});

Trainers.virtual('caught').get(function() {
  return this.pokemon.length;
});

Trainers.virtual('party').get(function() {
  return this.pokemon.filter(p=>p.party);
});

Trainers.virtual('shinies').get(function() {
  return this.pokemon.filter(p=>p.shiny);
});

Trainers.virtual('legends').get(function() {
  return this.pokemon.filter(p=>p.legend);
});

// Model
var Trainers = mongoose.model("Trainers", TrainersSchema); // Create collection model from schema
module.exports = Trainers; // export model
