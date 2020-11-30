const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema


var PermissionsSchema = new Schema({ // Create Schema
    allowAll: {type: Boolean, default: true, required: true}, //whether all users are given status of "basic/advanced" for command usage
    basic: {type: [String], default: []}, // IDs of role(s) that grant basic bot perms
    advanced: {type: [String], default: []}, // IDs of role(s) that grant bot perms for bonus stuff, like the daily command
    trusted: {type: [String], default: []}, // IDs of role(s) that grant bot perms for simple management stuff
    botcommander: {type: [String], default: []}, // IDs of role(s) that grant perms for advanced server management stuff (some ability is auto-given by server management or admin roles)
    purge: {type: Number, default: -1}, // whether or not to log or flag lurkers, -1 = no flagging, 0 = flag but don't purge, and if above 0 then that's how many warnings are needed to be purged
    spectator: {type: [String], default: []} // IDs of roles that prevent being flagged as a lurker
});

var PokeDataSchema = new Schema({
    spawnChannel: {type: String, default: ""}, // discord spawn channel ID
    lastSpawn: {type: Number, default: 0}, // unix time of last spawn
    legend: {type: Number, default: 0}, // 0 = no legend, otherwise it's the pokedex ID of the legend currently spawning in a server.
    legendSpawns: {type: [Number], default: []} // log of times when the current lurking legendary spawned
});

var LurkersSchema = new Schema({
  _id: {type: String, required: true}, // id of lurker on discord
  joinedAt: {type: Number, default: (new Date()).getTime(), required: true}, // timestamp of when they joined
  warnings: {type: Number, default: 0, required: true}, // number of warning pings about lurking
  lastPing: {type: Number, default: (new Date()).getTime(), required: true} // last time they were warned
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
    perms: {type: PermissionsSchema, default: {allowAll: true}, required: true}, // gulid perm settings
    lurkers: {type: [LurkersSchema], default: []},
    pokeData: {type: PokeDataSchema, default: {spawnChannel: "", lastSpawn: 0}}, // info on guild's pokemon shizwiz
    rpgzones: {type: [String], default: []} // channels where xp can be gained from rpg stuff (if enabled)
});

GuildSchema.virtual('id').get(function() {
  return this._id;
});

// Model
var Guilds = mongoose.model("Guilds", GuildSchema); // Create collection model from schema
module.exports = Guilds; // export model
