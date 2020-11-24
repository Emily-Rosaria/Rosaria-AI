const { pokemon } = require('./../../config.json'); // Pokemon config
const Discord = require('discord.js'); // Image embed

module.exports = {
  name: 'dex', // The name of the command
  description: 'Shows you your pokedex.', // The description of the command (for help text)
  perms: 'verified', //restricts to bot dev only (me)
  database: true,
  aliases: ['pokedex'],
  usage: '[user] [page-number]', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, db, args) {
    var user = message.author;
    var pageNum = 1;
    var log = false;
    if (args.length > 0) {
      if (!isNaN(args[0]) && Number(args[0]) < 10000) {
        pageNum = Number(args[0]);
        if (args.length > 1 && (args[1].toLowerCase() == 'true' || args[1].toLowerCase() == 't')) {
          log = true;
        }
        else if (args.length > 1) {
          user = message.client.users.cache.get(args[1].match(/\d+/)[0]) || user;
          if (args.length > 2) {
             log = (args[2].toLowerCase() == 'true' || args[2].toLowerCase() == 't');
          }
        }
      } else if (args[0].toLowerCase() == 'true' || args[0].toLowerCase() == 't') {
        log = true;
      } else {
        user = message.client.users.cache.get(args[0].match(/\d+/)[0]) || user;
        if (args.length > 1 && !isNaN(args[1])) {
          pageNum = Number(args[1]);
          if (args.length > 2) {
            log = (args[2].toLowerCase() == 'true' || args[2].toLowerCase() == 't');
          }
        } else if (args.length > 1) {
          log = (args[1].toLowerCase() == 'true' || args[1].toLowerCase() == 't');
        }
      }
    }
    var dexJSON = await db.get('poke_' + user.id);
    dexJSON = JSON.parse(dexJSON);
    if (log) {console.log(dexJSON)};
    var desc = 'Looks like this is empty... keep on training!';
    var normals = 0;
    var shinies = 0;
    var unique = 0;
    var dexList = [];
    if (dexJSON) {
      const keys = Array.from(Object.keys(dexJSON)).sort(function (a, b) {
        if (a.split('_')[0].length > b.split('_')[0].length) {
          return 1;
        } else if (a.split('_')[0].length < b.split('_')[0].length) {
          return -1;
        } else {
          if (a < b) {
            return -1;
          } else if (a > b) {
            return 1;
          } else {
            return 0;
          }
        }
      });
      for (const key of keys) {
        const counts = dexJSON[key];
        normals = normals + counts.normal;
        shinies = shinies + counts.shiny;
        var details = key.split('_');
        if ((counts.normal+counts.shiny) > 1) {
          var tempSum = (counts.normal+counts.shiny).toString();
          if ((counts.normal+counts.shiny) > 9) {
            tempSum = '9+';
          }
          details[1] = details[1] + '('+tempSum+')'
        }
        if (counts.shiny != 0) { details[1] = details[1] + '✨'}
          dexList = dexList.concat([details[0] + '. ' + details[1]]);
      }
      unique = dexList.length;
    }
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
        if (unique == pokemon.count) {
          desc = "Showing "+shownValues.toString()+" of <@"+user.id+">\'s "+unique.toString()+" unique Pokedex entries. This Pokedex is 100% complete!";
        } else if (unique == pokemon.count-1) {
          desc = "Showing "+shownValues.toString()+" of <@"+user.id+">\'s "+unique.toString()+" unique Pokedex entries. This Pokedex is only one Pokémon away from being completed!";         
        } else if (unique > pokemon.count-25) {
          desc = "Showing "+shownValues.toString()+" of <@"+user.id+">\'s "+unique.toString()+" unique Pokedex entries. This bot supports Pokémon up to Gen 4, meaning this Pokedex is "+(100*unique/pokemon.count).toFixed(1)+"% complete. Only "+(pokemon.count-unique).toString()+" more Pokémon remain!";
        } else if (unique > 45) {
          desc = "Showing "+shownValues.toString()+" of <@"+user.id+">\'s "+unique.toString()+" unique Pokedex entries. This bot supports Pokémon up to Gen 4, meaning this Pokedex is ~"+ (100*unique/pokemon.count).toFixed(1).toString() +"% complete.";
        } else {
          desc = "Showing "+unique.toString()+" of all theoretical "+pokemon.count.toString()+" Pokedex entries. This bot supports Pokémon up to Gen 4, meaning this Pokedex is ~"+ (100*unique/pokemon.count).toFixed(1).toString() +"% complete.";
        }
    }
    var title = user.username + '\'s ' + 'Pokedex';
    if (pages != 1) {title = title + " - Page ["+pageNum+"] of ["+pages+"]"}
    var col1 = dexList.slice((pageNum-1)*45,((pageNum-1)*45)+colSize[0]).join('\n');
    var col2 = dexList.slice(((pageNum-1)*45)+colSize[0],((pageNum-1)*45)+colSize[0]+colSize[1]).join('\n');
    var col3 = dexList.slice(((pageNum-1)*45)+colSize[0]+colSize[1],((pageNum-1)*45)+colSize[0]+colSize[1]+colSize[2]).join('\n');
    if (!col1) { col1 = "Empty" }
    if (!col2) { col2 = "Empty" }
    if (!col3) { col3 = "Empty" }
    normals = normals + shinies;
    const dexEmbed = new Discord.MessageEmbed()
      .setColor('#3b4cca')
      .setTitle(title)
      .setAuthor(user.username, user.displayAvatarURL())
      .setDescription(desc)
      .setThumbnail('https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
      .addField('\u200b',col1,true)
      .addField('\u200b',col2,true)
      .addField('\u200b',col3,true)
      .addField('Total Pokémon',normals.toString(),true)
      .addField('Unique Pokémon',unique.toString()+'/'+pokemon.count.toString(),true)
      .addField('Shiny Pokémon',shinies.toString(),true)
      .setTimestamp()
      .setFooter('Keep training and one day you\'ll catch \'em all!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
    message.channel.send(dexEmbed);
  },
};