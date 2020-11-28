const Canvas = require('canvas'); // Drawings
const Discord = require('discord.js'); // Image embed
const Trainers = require('./../database/models/trainers.js');
const Pokedex = require('./../database/models/pokedex.js');
const GuildData = require('./../database/models/guilds.js');
const PokeSpawns = require('./../database/models/spawnedpokemon.js');

module.exports = async function (legend, channel) {
    channel.send("... the air seems quiet.");
}
