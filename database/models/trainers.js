const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var TrainerPokemonSchema = new Schema({
    id: {type: Number, required: true}, //pokedex Number
    name: {type: String, required: true}, // species name
    gender: {type: String, enum: ["male","female","genderless"]}, // male/female
    nickname: {type: String, default: this.name}, //User-set name. Defaults to the pokemon's species name
    friendship: {type: Number, default: 50},
    captureDate: {type: Number, default: (new Date()).getTime()}, // unix time of capture
    legend: {type: Boolean, default: false},
    shiny: {type: Boolean, default: false},
    party: {type: Boolean, default: false}
});

var EggsSchema = new Schema({
    id: {type: Number, required: true}, //pokedex Number of the pokemon it will be
    dateObtained: {type: Number, default: (new Date()).getTime()}, // unix time of capture
    shinyOdds: {type: Number, default: 0.0025}, // shiny chance, as a decimal
    inclubating: {type: Boolean, default: false}, // if the egg is being incubated
    startedIncubating: {type: Number, default: -1} // when incubation began, unix time, -1 if never started
});

var TrainersSchema = new Schema({ // Create Schema
    _id: {type: String, required: true}, // ID of user on Discord
    counters: {
      type: Map,
      of: Number
    }, // E.g. {pokeballs: 5}, etc.
    cooldowns: {  // this is a map, so use .get() and .set()
      type: Map,  // Example: {pokecatch: Number}, {daily: Number}
      of: Number // numbers are Unix time and correspond to when the cooldown will expire
    },
    currency: {
      type: Map,  // currency "name", like tokens, coins, etc.
      of: Number // amount of currency
    },
    documents: {
      type: Map,  // documents "names" - like a character name or copypasta name.
      of: String // document "keys (for use with a document model)"
    },
    exp: {type: Number, default: 0},
    nickname: {type: String, default: ""},  // User set trainer-based alias.
    tagline: {type: String, default: ""}, // Trainer/user quote.
    registrationDate: {type: Number, default: (new Date()).getTime()}, // unix time of signup/first catch
    pokemon: {type: [TrainerPokemonSchema], default: []}, //array of all their pokemon
    eggs: {type: [EggsSchema], default: []} //array of all their eggs
});

TrainersSchema.virtual('id').get(function() {
  return this._id;
});

TrainersSchema.virtual('caught').get(function() {
  return this.pokemon.length;
});

TrainersSchema.virtual('incubating').get(function() {
  return this.eggs.filter(e=>e.inclubating);
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

TrainersSchema.virtual('unique').get(function() {
  let arr = [];
  this.pokemon.forEach(p=>{
    if (!arr.includes(p.id)) {arr.push(p.id)}
  });
  return arr.length;
});

TrainersSchema.method('addPokemon', function(PokemonDoc, shinyOdds) {
  const shinyNum = shinyOdds === 0 ? 0 : shinyOdds || 0.0005;
  const addToParty = this.party.length<6;
  let newPoke = {
    id: PokemonDoc.id,
    name: PokemonDoc.name,
    nickname: PokemonDoc.name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-'),
    gender: PokemonDoc.randomGender(Math.random()),
    legend: PokemonDoc.legend,
    party: addToParty,
    shiny: (Math.random()+shinyNum)>1,
    captureDate: (new Date()).getTime()
  };
  const newCount = this.pokemon.push(newPoke);
  return {trainerPokemon: newPoke, newCount: newCount};
});

// Model
var Trainers = mongoose.model("Trainers", TrainersSchema); // Create collection model from schema
module.exports = Trainers; // export model
