const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema


var PermissionsSchema = new Schema({ // Create Schema
    allowAll: {type: Boolean, default: true, required: true}, //whether all users are given status of "basic/advanced" for command usage
    basic: {type: [String], default: []}, // IDs of role(s) that grant basic bot perms
    advanced: {type: [String], default: []}, // IDs of role(s) that grant bot perms for bonus stuff, like the daily command
    trusted: {type: [String], default: []}, // IDs of role(s) that grant bot perms for simple management stuff
    botcommander: {type: [String], default: []} // IDs of role(s) that grant perms for advanced server management stuff (some ability is auto-given by server management or admin roles)
});

const defaultPerms = {
  allowAll: true,
  basic: [],
  advanced: [],
  trusted: [],
  botcommander: [],
}

var GuildSchema = new Schema({
    _id: {type: String, required: true}, //discord server ID
    prefix: {type: [String], default: ["r!"]}, // command prefix - array of accepted prefixes
    perms: {type: PermissionsSchema, required: true},
    pokemonspawns: {type: String, default: ""}, // channel to use for pokemon spawns
    lastspawn: {type: Number, default: 1}, // unix time
    rpgzones: {type: [String], default: []} // channels where xp can be gained from rpg stuff (if enabled)
});

GuildSchema.virtual('id').get(function() {
  return this._id;
});

// Model
var Guilds = mongoose.model("Guilds", GuildSchema); // Create collection model from schema
module.exports = Guilds; // export model
