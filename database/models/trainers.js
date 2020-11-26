const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var TrainerPokemonSchema = new Schema({
    id: {type: Number, required: true}, //pokedex Number
    name: {type: String, required: true}, // species name
    gender: {type: String, enum: ["male","female","genderless"]}, // male/female
    nickname: {type: String, default: this.name}, //User-set name. Defaults to the pokemon's species name
    friendship: {type: Number, default: 50},
    captureDate: {type: Number, default: new Date().getTime()}, // unix time of capture
    legend: {type: Boolean, default: false},
    shiny: {type: Boolean, default: false},
    party: {type: Boolean, default: false}
});

var EggsSchema = new Schema({
    id: {type: Number, required: true}, //pokedex Number of the pokemon it will be
    dateObtained: {type: Number, default: new Date().getTime()}, // unix time of capture
    inclubating: {type: Boolean, default: false}, // if the egg is being incubated
    startedIncubating: {type: Number, default: -1} // when incubation began, unix time, -1 if never started
});

var TrainersSchema = new Schema({ // Create Schema
    id: {type: String, required: true}, // ID of user on Discord
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

TrainersSchema.virtual('caught').get(function() {
  return this.pokemon.length;
});

TrainersSchema.virtual('party').get(function() {
  return this.pokemon.filter(p=>p.party);
});

TrainersSchema.virtual('shinies').get(function() {
  return this.pokemon.filter(p=>p.shiny);
});

TrainersSchema.virtual('legends').get(function() {
  return this.pokemon.filter(p=>p.legend);
});

TrainersSchema.method('catchPokemon', function(PokemonDoc) {
  let newPoke = {
    id: PokemonDoc.id,
    name: PokemonDoc.name,
    gender: PokemonDoc.randomGender,
    nickname: PokemonDoc.name,
    legend: PokemonDoc.legend,
    party: false,
    shiny: (Math.random()+0.0025)>1
  };
  this.pokemon.push(newPoke);
  return newPoke;
});

// Model
var Trainers = mongoose.model("Trainers", TrainersSchema); // Create collection model from schema
module.exports = Trainers; // export model
