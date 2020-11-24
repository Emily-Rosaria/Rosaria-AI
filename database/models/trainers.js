const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var TrainerPokemonSchema = new Schema({
    id: Number, //pokedex Number
    name: String, // species name
    gender: String, // male/female
    nickname: String, //User-set name. Defaults to the pokemon's species name
    captureData: Number, // unix time of capture
});

var TrainersSchema = new Schema({ // Create Schema
    id: String, // ID of user on Discord
    nickname: {type: String, default: ""},  // User set trainer-based alias.
    tagline: {type: String, default: ""}, // Trainer quote.
    registrationDate: {type: Number, default: new Date.now().getTime()}, // unix time of signup/first catch
    pokemon: {type: [TrainerPokemonSchema], default: []} //array of all their pokemon
});

// Model
var Trainers = mongoose.model("Trainers", TrainersSchema); // Create collection model from schema
module.exports = Trainers; // export model
