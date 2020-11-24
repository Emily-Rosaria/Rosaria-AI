const { pokemon } = require('./../../config.json'); // Pokemon config
const Discord = require('discord.js'); // Image embed

module.exports = {
  name: 'catchstats', // The name of the command
  description: 'Shows the catch/escape rates of different pokemon.', // The description of the command (for help text)
  perms: 'verified', //restricts to bot dev only (me)
  database: true,
  cooldown: 10,
  aliases: ['pokestats'],
  usage: '[page-number]', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, db, args) {
    const bot = message.client.user;
    var pageNum = !isNaN(args[0]) ? Number(args[0]) : 1;
    
    var dexJSON = await db.get('poke_bot');
    dexJSON = JSON.parse(dexJSON);
    var desc = 'Looks like this is empty...';
    var catchTotal = 0;
    var escapeTotal = 0;
    var legendaries = [0,0];
    var dexList = [];
    var favePoke = ['0','???',0];
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
        catchTotal = catchTotal + counts.caught;
        escapeTotal = escapeTotal + counts.escaped;
        var details = key.split('_'); 
        if (pokemon.legends.includes(Number(details[0]))) {
          legendaries[0] += counts.caught;
          legendaries[1] += counts.escaped;
        }
        percent = ((counts.caught/(counts.caught+counts.escaped)) * 100).toFixed(1) + '%';
        dexList = dexList.concat([details[0] + '. ' + details[1] + ' (' + percent + ', ' + (counts.caught+counts.escaped).toString() + ')']);
        if (counts.caught>favePoke[2]) {
          favePoke = [details[0],details[1],counts.caught];
        }
      }
    }
    favePoke = favePoke[1]+': x'+favePoke[2].toString();
    unique = dexList.length;
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
        colSize = [lower, lower] // same as upper, as shownValues mod 3 = 0
      } else if (rounding == 1) {
        colSize = [upper, lower]
      /*} else if (rounding == 2) {
        colSize = [upper, upper, lower]
      } else if (rounding == 3) {
        colSize = [upper, upper, upper] */
      };
    };
    const legTotal = legendaries[0]+legendaries[1];
    const legPers = ((legendaries[0]/legTotal) * 100).toFixed(1) + '%';
    const totalPers = ((catchTotal/(catchTotal+escapeTotal)) * 100).toFixed(1) + '%';
    if (unique) {
      desc = 'So far, a total of '+(catchTotal+escapeTotal).toString()+' Pokémon have spawned, of which '+catchTotal.toString() +' were caught.';
      if (unique<pokemon.count) {
        desc = desc + ' There are at least '+(pokemon.count-unique).toString()+' Pokémon that have yet to be discovered, so stay tuned and keep training!';
      }
    }
    var title = 'Wild Pokémon Stats';
    if (pages != 1) {title = title + " - Page ["+pageNum+"] of ["+pages+"]"}
    var col1 = dexList.slice((pageNum-1)*50,((pageNum-1)*50)+colSize[0]).join('\n');
    var col2 = dexList.slice(((pageNum-1)*50)+colSize[0],((pageNum-1)*50)+colSize[0]+colSize[1]).join('\n');
    //var col3 = dexList.slice(((pageNum-1)*45)+colSize[0]+colSize[1],((pageNum-1)*45)+colSize[0]+colSize[1]+colSize[2]).join('\n');
    if (!col1) { col1 = "Empty" }
    if (!col2) { col2 = "Empty" }
    //if (!col3) { col3 = "Empty" }
    const dexEmbed = new Discord.MessageEmbed()
      .setColor('#3b4cca')
      .setTitle(title)
      .setAuthor(bot.username, bot.displayAvatarURL())
      .setDescription(desc)
      .setThumbnail('https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
      .addField('Pokémon Catch Rate',totalPers +' of '+(catchTotal+escapeTotal).toString(),true)
      .addField('Legendary Catches',legPers +' of '+legTotal,true)
      .addField('Top Pokémon',favePoke,true)
      .addField('Column 1',col1,true)
      .addField('Column 2',col2,true)
      .setTimestamp()
      .setFooter('Keep training and one day you\'ll catch \'em all!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
    message.channel.send(dexEmbed);
  },
};