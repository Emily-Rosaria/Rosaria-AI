const Canvas = require('canvas'); // Drawings
const Discord = require('discord.js'); // Image embed
const Trainers = require('../database/modules/trainers.js');
const Pokedex = require('../database/modules/pokedex.js');
const Legends = require('../database/modules/legends.js');
const PokeSpawns = require('../database/modules/spawnedpokemon.js');

module.exports = {
  name: 'pokemon', // The name of the interval
  description: 'Who\'s that Pokémon?', // The description of the interval (for help text)
  async execute(channel) {
    const legend = Legends.findOne({guildid: channel.guild.id}).exec();
    let spawnLegend = true;
    if (legend && Math.random()+0.2>1) {
      const LegendSpawn = require('./legendspawn.js');
      return LegendSpawn(legend, channel);
    } else {
      spawnLegend = false;
    }
    wildPokemon = await Pokedex.randomWild(spawnLegend);
    if (wildPokemon.legend) {
      const LegendSpawn = require('./legendspawn.js');
      legend = await Legends.create({
        id: wildPokemon.id,
        guildid: channel.guild.id,
        appearances: [new Date().getTime()]
      });
      return LegendSpawn(legend, channel);
    }
    const toDuration = require('../misc_functions/toDuration.js');
    const imgPath = channel.client.pokeConfig.get("imgPath");
    var pokemonName = name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
    console.log(pokemonName+" just spawned on "+channel.guild.name+".");
    const pokemonURL = imgPath+pokemon.img;
    const lingerTime = channel.client.pokeConfig.get("lingerTime");
    const cooldown = channel.client.pokeConfig.get("cooldown");
    const shinyOdds = channel.client.pokeConfig.get("shinyOdds");
    const canvas = Canvas.createCanvas(960, 540);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./bot_assets/mystery-pokemon.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    const mysteryIMG = Canvas.createCanvas(960, 540);
    const ctx2 = mysteryIMG.getContext('2d');
    const pokemonIMG = await Canvas.loadImage(pokemonURL);
    ctx2.drawImage(pokemonIMG, 20, 20);
    ctx2.globalCompositeOperation = 'source-in';
    ctx2.fillRect(0, 0, 960, 540);
    ctx.drawImage(mysteryIMG, 0, 0);
    const attachment1 = new Discord.MessageAttachment(canvas.toBuffer(), 'mystery-pokemon-encounter.png');
    ctx.drawImage(pokemonIMG, 20, 20);
    const attachment2 = new Discord.MessageAttachment(canvas.toBuffer(), 'wild-' + pokemonName + '.png');
    const embed1 = new Discord.MessageEmbed()
      .setColor('#FF0000')
      .setDescription("Who\'s that Pokémon? Say its name to throw a pokeball and catch it!")
      .setImage('attachment://mystery-pokemon-encounter.png')
      .setTimestamp()
      .setTitle('A wild Pokémon appears...')
      .setFooter('Hurry up before it gets away!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
    const embed2 = new Discord.MessageEmbed()
      .setColor('#FF0000')
      .setImage('attachment://wild-' + pokemonName + '.png');
    channel.send({files: [attachment1], embed: embed1})
    .then( () => {
      const filter = async (m) => {
        if (!(m.content.toLowerCase().replace(/ /gi, '-').replace(/\./gi, '').startsWith(pokemonName.toLowerCase()))) { return false; }
        const now = new Date().getTime();
        const trainer = await Trainers.findById(m.author.id).exec();
        if (!trainer) {
          m.reply("Please register as a Pokémon Trainer before venturing into the tall grass. You can do so by using the `r!starter` or `r!register` commands.");
          return false;
        }
        const cooldowns = trainer.cooldowns;
        if (!cooldowns.pokecatch) {return true}
        const timeDiff = cooldowns.pokecatch - now;
        if (timeDiff < 0) { return true; }
        const timePhrase = toDuration(timeDiff);
        m.reply('Don\'t wear yourself out. You can only catch one Pokémon per '+cooldown.toString()+' minutes! You\'ve got about `' + timePhrase + '` left until you can catch again.');
        return false;
      }
      channel.awaitMessages(filter, { max: 1, time: lingerTime, errors: ['time'] })
      .then( async (collected) => {
        const winner = collected.first().author;
        let wtrainer = await Trainers.findById(winner.id).exec();
        const {trainerPokemon} = wtrainer.addPokemon(wildPokemon, shinyOdds);
        wtrainer.cooldowns.pokecatch = new Date().getTime() + cooldown;
        const shiny = trainerPokemon.shiny;
        embed2.setDescription('<@' + winner.id + '> caught a ' + pokemonName + '!').setTimestamp().setTitle('Pokémon Caught!').setAuthor(winner.username, winner.displayAvatarURL()).setFooter('Use `r!dex` to see all the Pokémon you\'ve discovered.','https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
        wtrainer = await wtrainer.save();
        await PokeSpawns.create({
          id: wildPokemon.id,
          name: wildPokemon.name,
          escaped: true, // whether or not it was caught
          legend: wildPokemon.legend, // whether or not the pokemon was legendary
          source: "wild",
          time: new Date().getTime(), // unix time of escape/capture
          guild: channel.guild.id, // server ID on discord where it appeared
          catcherID: winner.id, // discord id of user who caught pokemon
          shiny: shiny
        });
        if (shiny) {
          channel.send('Something looks a little different about this Pokémon... ✨\n`This Pokémon is shiny. Currently, the sprites are work-in-progess, but you can still feel cool about it!`')
        }
        if (!shiny) { console.log(winner.username+" caught a "+pokemonName+ " on "+channel.guild.name) } else { console.log(winner.username+" caught a SHINY "+pokemonName+ " on "+channel.guild.name) }
      })
      .catch( async (collected) => {
        embed2.setDescription('Oh no... the wild Pokémon excaped before anyone could catch it... It was a ' + pokemonName + '.').setTimestamp().setTitle('Wild '+pokemonName+' Fled').setFooter('Better luck next time...','https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
        channel.send({files: [attachment2], embed: embed2});
        console.log(pokemonName+" fled from " +channel.guild.name+ " before it could be caught...");
        await PokeSpawns.create({
          id: wildPokemon.id,
          name: wildPokemon.name,
          escaped: true, // whether or not it was caught
          legend: wildPokemon.legend, // whether or not the pokemon was legendary
          source: "wild",
          time: new Date().getTime(), // unix time of escape/capture
          guild: channel.guild.id // server ID on discord where it appeared
        });
      });
    })
    .catch( () => {console.log("Pokémon broke fix pls")})
  },
};
