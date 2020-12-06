const Discord = require('discord.js'); // Image embed
const PokeSpawns = require('./../../database/models/spawnedpokemon.js');
const Pokedex = require('./../../database/models/pokedex.js');

module.exports = {
  name: 'pokestats', // The name of the command
  description: 'Shows the catch/escape rates of different pokemon.', // The description of the command (for help text)
  perms: 'verified',
  allowDM: true,
  cooldown: 10,
  aliases: ['catchstats'],
  usage: '[page-number] [source (e.g. "starter", "event", "daily", "wild", "egg") - defaults to "all"]', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    const bot = message.client.user;
    var pageNum = !isNaN(args[0]) ? Number(args[0]) : 1;

    const pokedexSize = await Pokedex.countDocuments({});

    const pokeData = await PokeSpawns.find({}).exec();

    var desc = 'Looks like this is empty... Keep on exploring and you\'ll be sure to fill this in no time!';
    var total = 0;
    var caught = 0;
    var shinies = 0;
    var legends = 0;
    var dexFormat = {};
    var textArray = [];
    var top = [0];
    if (pokeData) {
      const pokes = pokeData.sort((p1,p2)=>p1.id-p2.id);
      pokes.forEach((p) => {
        if (!dexFormat[p.id+"_"+p.name]) {
          dexFormat[p.id+"_"+p.name] = {caught: 0, escaped: 0};
        }
        if (p.escaped) {
          dexFormat[p.id+"_"+p.name].escaped += 1;
        } else {
          dexFormat[p.id+"_"+p.name].caught += 1;
          caught += 1;
        }
        if (p.shiny) {shinies += 1}
        if (p.legend) {legends += 1}
        total += 1;
      });
      textArray = Object.entries(dexFormat).map(p=>{
        let nameID = p[0].split('_');
        nameID[1] = nameID[1].split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
        if (top[0] < p[1].caught) {top = [p[1].caught].concat(nameID)}
        const stats = ' ('+ p[1].caught+' of '+(p[1].caught+p[1].escaped)+')';
        return nameID[0]+'. '+ nameID[1] + stats;
      });
    }
    const unique = textArray.length;
    const uniqueCaught = Object.entries(dexFormat).filter(p => p[1].caught > 0).length;
    const pages = Math.ceil(unique/50);
    if (pageNum < 1) {pageNum = 1}
    else if (pageNum > pages) {pageNum = pages};
    var colSize = [25,25];
    const shownValues = (50*pageNum > unique) ? unique % 50: 50;
    if (50*pageNum > unique) {
      const rounding = (shownValues % 2);
      const upper = Math.ceil(shownValues/2);
      const lower = Math.floor(shownValues/2);
      if (rounding == 0) {
        colSize = [lower, lower];
      } else if (rounding == 1) {
        colSize = [upper, lower];
      };
    };

    const totalPers = ((caught/total) * 100).toFixed(1) + '%';
    const dexPers = ((uniqueCaught/pokedexSize) * 100).toFixed(1) + '%';

    if (unique) {
      desc = 'So far, a total of '+(total).toString()+' Pokémon have spawned, of which '+caught.toString() +' were caught.';
      if (uniqueCaught<pokedexSize) {
        desc = desc + ' There are at least '+(pokedexSize-uniqueCaught).toString()+' Pokémon that have yet to be discovered, so stay tuned and keep training!';
      }
    }
    var title = 'Pokémon Stats';
    if (pages != 1) {title = title + " - Page ["+pageNum+"] of ["+pages+"]"}
    var col1 = textArray.slice((pageNum-1)*50,((pageNum-1)*50)+colSize[0]).join('\n');
    var col2 = textArray.slice(((pageNum-1)*50)+colSize[0],((pageNum-1)*50)+colSize[0]+colSize[1]).join('\n');
    if (!col1) { col1 = "Empty" }
    if (!col2) { col2 = "Empty" }
    const dexEmbed = new Discord.MessageEmbed()
      .setColor('#3b4cca')
      .setTitle(title)
      .setAuthor(bot.username, bot.displayAvatarURL())
      .setDescription(desc)
      .setThumbnail('https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
      .addField('Pokémon Catch Rate',caught+' of '+total+', '+totalPers+'.',true)
      .addField('Global Pokédex Completion',''+uniqueCaught+' of '+pokedexSize+', '+dexPers+'.',true)
      .addField('Top Pokémon',top[2]+': x'+top[0],true)
      .addField('Column 1',col1,true)
      .addField('Column 2',col2,true)
      .setTimestamp()
      .setFooter('Keep training and one day you\'ll catch \'em all!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
    message.channel.send(dexEmbed);
  },
};
