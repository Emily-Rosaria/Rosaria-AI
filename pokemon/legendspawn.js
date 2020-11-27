const Canvas = require('canvas'); // Drawings
const Discord = require('discord.js'); // Image embed
const Trainers = require('./../database/models/trainers.js');
const Pokedex = require('./../database/models/pokedex.js');
const Legends = require('./../database/models/legends.js');
const PokeSpawns = require('./../database/models/spawnedpokemon.js');

module.export = async function (legend, channel) {
    channel.send("... the air seems quiet.");
}
