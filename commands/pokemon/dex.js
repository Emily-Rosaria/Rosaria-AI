const Trainers = require('./../../database/models/trainers.js');
const Discord = require('discord.js'); // Image embed
const Pokedex = require('./../../database/models/pokedex.js');

module.exports = {
  name: 'dex', // The name of the command
  description: 'Shows you your pokedex.', // The description of the command (for help text)
  perms: 'basic', //restricts to bot dev only (me)
  allowDM: true,
  aliases: ['pokedex'],
  usage: '[user] [page-number]', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    var user = message.author;
    var pageNum = 1;
    var log = false;
    const pokedexSize = await Pokedex.countDocuments({});
    for (const arg of [].concat(args).reverse()) {
      if (!isNaN(arg) && Number(args[0]) < 10000) {
        pageNum = Number(args[0]);
      } else if (arg.match(/\d{10,}/)) {
        const tempU = message.client.users.cache.get(arg.match(/\d{10,}/)[0]);
        if (tempU) {
          user = tempU;
        } else {
          const tempU2 = await message.client.users.fetch(arg.match(/\d{10,}/)[0]);
          if (tempU2) {
            user = tempU2;
          }
        }
      }
    }
    var trainer = await Trainers.findById(user.id).exec();
    var desc = 'Looks like this is empty... keep on training! You can get started with `r!starter`.';
    var total = 0;
    var shinies = 0;
    var unique = 0;
    var dexFormat = {};
    var textArray = [];
    if (trainer && trainer.pokemon && trainer.pokemon.length > 0) {
      const pokes = trainer.pokemon.sort((p1,p2)=>p1.id-p2.id);
      pokes.forEach((p) => {
        if (!dexFormat[p.id+"_"+p.name]) {
          dexFormat[p.id+"_"+p.name] = {count: 0, shiny: false};
        }
        if (p.shiny) {
          shinies += 1;
          if (!dexFormat[p.id+"_"+p.name].shiny) {
            dexFormat[p.id+"_"+p.name].shiny = true;
          }
        }
        total += 1;
        dexFormat[p.id+"_"+p.name].count += 1;
      });
      textArray = Object.entries(dexFormat).map(p=>{
        let shiny = p[1].shiny ? '✨' : '';
        let nameID = p[0].split('_')
        nameID[1] = nameID[1].split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
        return nameID[0]+'. '+nameID[1] + shiny;
      });
    }
    unique = textArray.length;
    const pages = Math.ceil(unique/45);
    if (pageNum < 1) {pageNum = 1}
    else if (pageNum > pages) {pageNum = pages};
    var colSize = [15,15,15];
    const shownValues = (45*pageNum > unique) ? unique % 45: 45;
    if (45*pageNum > unique) {
      const rounding = (shownValues % 3);
      const upper = Math.ceil(shownValues/3);
      const lower = Math.floor(shownValues/3);
      if (rounding == 0) {
        colSize = [lower, lower, lower] // same as upper, as shownValues mod 3 = 0
      } else if (rounding == 1) {
        colSize = [upper, lower, lower]
      } else if (rounding == 2) {
        colSize = [upper, upper, lower]
      } else if (rounding == 3) {
        colSize = [upper, upper, upper]
      };
    };
    if (unique) {
      if (unique == pokedexSize) {
        desc = "Showing "+shownValues.toString()+" of <@"+user.id+">\'s "+unique.toString()+" unique Pokédex entries. This Pokédex is 100% complete!";
      } else if (unique == pokedexSize-1) {
        desc = "Showing "+shownValues.toString()+" of <@"+user.id+">\'s "+unique.toString()+" unique Pokédex entries. This Pokédex is only one Pokémon away from being completed!";
      } else if (unique > pokedexSize-25) {
        desc = "Showing "+shownValues.toString()+" of <@"+user.id+">\'s "+unique.toString()+" unique Pokédex entries. This bot supports Pokémon up to Gen 4, meaning this Pokédex is "+(100*unique/pokedexSize).toFixed(1)+"% complete. Only "+(pokedexSize-unique).toString()+" more Pokémon remain!";
      } else if (unique > 45) {
        desc = "Showing "+shownValues.toString()+" of <@"+user.id+">\'s "+unique.toString()+" unique Pokédex entries. This bot supports Pokémon up to Gen 4, meaning this Pokédex is ~"+ (100*unique/pokedexSize).toFixed(1).toString() +"% complete.";
      } else {
        desc = "Showing "+unique.toString()+" of all theoretical "+pokedexSize.toString()+" Pokédex entries. This bot supports Pokémon up to Gen 4, meaning this Pokédex is ~"+ (100*unique/pokedexSize).toFixed(1).toString() +"% complete.";
      }
    }
    const foot = unique == pokedexSize ? 'Wow! You\'ve caught every Pokémon! That\'s phenomenal!' : 'Keep training and one day you\'ll catch \'em all!'
    var title = user.username + '\'s ' + 'Pokédex';
    if (pages != 1) {title = title + " - Page ["+pageNum+"] of ["+pages+"]"}
    var col1 = textArray.slice((pageNum-1)*45,((pageNum-1)*45)+colSize[0]).join('\n');
    var col2 = textArray.slice(((pageNum-1)*45)+colSize[0],((pageNum-1)*45)+colSize[0]+colSize[1]).join('\n');
    var col3 = textArray.slice(((pageNum-1)*45)+colSize[0]+colSize[1],((pageNum-1)*45)+colSize[0]+colSize[1]+colSize[2]).join('\n');
    if (!col1) { col1 = "Empty" }
    if (!col2) { col2 = "Empty" }
    if (!col3) { col3 = "Empty" }
    const dexEmbed = new Discord.MessageEmbed()
      .setColor('#3b4cca')
      .setTitle(title)
      .setAuthor(user.username, user.displayAvatarURL())
      .setDescription(desc)
      .setThumbnail('https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
      .addField('\u200b',col1,true)
      .addField('\u200b',col2,true)
      .addField('\u200b',col3,true)
      .addField('Total Pokémon',total.toString(),true)
      .addField('Unique Pokémon',unique.toString()+'/'+pokedexSize.toString(),true)
      .addField('Shiny Pokémon',shinies.toString(),true)
      .setTimestamp()
      .setFooter(foot, 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
    message.channel.send(dexEmbed);
  },
};
