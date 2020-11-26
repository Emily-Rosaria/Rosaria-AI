const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var LegendSchema = new Schema({
    id: {type: Number, required: true}, // pokedex ID of the legendary
    guildid: {type: String, required: true}, //discord guild ID where it's "lurking"
    appearances: {type: [Number], default: [new Date().getTime()]}, // array of times it spawned, in unix time
});

// Model
var Legends = mongoose.model("Legends", LegendSchema); // Create collection model from schema
module.exports = Legends; // export model
