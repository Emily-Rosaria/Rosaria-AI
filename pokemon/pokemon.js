const Canvas = require('canvas'); // Drawings
const Discord = require('discord.js'); // Image embed
const Trainers = require('./../database/models/trainers.js');
const Pokedex = require('./../database/models/pokedex.js');
const GuildData = require('./../database/models/guilds.js');
const PokeSpawns = require('./../database/models/spawnedpokemon.js');

async function nextSpawn(channel,nextDelay) {
  const timeout = channel.client.setTimeout(spawnPokemon,nextDelay,channel);
  channel.client.spawnloops.set("pokemon"+channel.id,timeout);
  channel.client.spawnloops.array();
}

async function spawnPokemon(channel) {
  var guildInfo = await GuildData.findById(channel.guild.id).exec();
  if (!guildInfo) {return channel.send("Could not find guild info. Please configure the bot.")}
  else if (!guildInfo.pokeData) {return channel.send("Could not find guild's pokemon spawning data. Please configure the bot.")}
  const minDelay = channel.client.pokeConfig.get("minDelay");
  const randomDelay = channel.client.pokeConfig.get("randomDelay");
  const startTime = (new Date()).getTime();
  const toDuration = require('../misc_functions/toDuration.js');
  const LegendSpawn = require('./legendspawn.js');
  //if (guildInfo.pokeData.lastSpawn + minDelay > startTime) {return console.log("Attempted to run pokemon spawn at "+channel.name+" - "+channel.id+" but cancelled to prevent spawn spam. Last spawn was: "+toDuration(startTime-guildInfo.pokeData.lastSpawn)+" ago.")}
  let spawnLegend = guildInfo.pokeData.spawnChannel == channel.id;
  const options = {new: true};
  const query = {"_id": guildInfo._id, "pokeData._id": guildInfo.pokeData._id};
  if (spawnLegend && guildInfo.pokeData.legend && guildInfo.pokeData.legend != 0) {
    const lastLeg = guildInfo.pokeData.legendSpawns && guildInfo.pokeData.legendSpawns.length > 0 ? guildInfo.pokeData.legendSpawns.reduce((acc,cur)=>{if (acc>cur) {return acc} else {return cur}}) : 0;
    const hourMS = 3600000;
    const wait = (startTime - lastLeg) / hourMS; // number of hours since last legendary spawn
    if (Math.random() > 1.2 - (wait/10)) {
      const wildPokemon = await Pokedex.findById(guildInfo.pokeData.legend);
      if (guildInfo.pokeData.legendSpawns && guildInfo.pokeData.legendSpawns.length > 0) {
        guildInfo = await GuildData.findByIdAndUpdate(query,{"$push": {"pokeData.legendSpawns": startTime}, "$set": {"pokeData.lastSpawn": startTime} },options).exec();
      } else {
        guildInfo = await GuildData.findByIdAndUpdate(query,{"$set": {"pokeData.lastSpawn": startTime, "pokeData.legendSpawns": [startTime]} },options).exec();
      }
      return LegendSpawn(wildPokemon, guildInfo, channel);
    } else {
      spawnLegend = false;
    }
  }
  const wildPokemon = await Pokedex.randomWild(spawnLegend, Math.random());
  if (wildPokemon.legend) {
    guildInfo = await GuildData.findByIdAndUpdate(query,{"$set": {"pokeData.lastSpawn": startTime, "pokeData.legend": wildPokemon.id, "pokeData.legendSpawns": [startTime]}},options).exec();
    return LegendSpawn(wildPokemon, guildInfo, channel);
  }
  guildInfo = await GuildData.findByIdAndUpdate(query,{"$set": {"pokeData.lastSpawn": startTime}},options).exec();
  const imgPath =  "./"; //using local file instead of channel.client.pokeConfig.get("imgPath");
  var pokemonName = wildPokemon.name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
  const pokemonURL = imgPath+wildPokemon.imgs.normal;
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
  const embed1 = new Discord.MessageEmbed()
    .setColor('#FF0000')
    .setDescription("Who\'s that Pokémon? Say its name to throw a pokeball and catch it!")
    .setImage('attachment://mystery-pokemon-encounter.png')
    .setTimestamp()
    .setTitle('A wild Pokémon appears...')
    .setFooter('Hurry up before it gets away!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
  const embed2 = new Discord.MessageEmbed()
    .setColor('#FF0000')
    .setImage('attachment://wild-' + wildPokemon.name + '.png');
  channel.send({files: [attachment1], embed: embed1})
  .then( () => {
    const filter = async (m) => {
      if (!(m.content.toLowerCase().replace(/ /gi, '-').replace(/[.'":]/gi, '').startsWith(pokemonName.toLowerCase()))) { return false; }
      const now = (new Date()).getTime();
      const trainer = await Trainers.findById(m.author.id).exec();
      if (!trainer || !trainer.pokemon) {
        m.reply("Please register as a Pokémon Trainer before venturing into the tall grass. You can do so by using the `r!starter` or `r!register` commands.");
        return false;
      }
      const cooldowns = trainer.cooldowns;
      if (!cooldowns) {return true}
      if (!cooldowns.get("pokecatch")) {return true}
      const timeDiff = cooldowns.get("pokecatch") - now;
      if (timeDiff < 0) { return true; }
      m.reply('Don\'t wear yourself out. You can only catch one Pokémon per '+toDuration(cooldown)+'! You\'ve got about `' + toDuration(timeDiff) + '` left until you can catch again.');
      return false;
    }
    channel.awaitMessages(filter, { max: 1, time: lingerTime, errors: ['time'] })
    .then( async (collected) => {
      try {
        const winner = collected.first().author;
        let wtrainer = await Trainers.findById(winner.id).exec();
        const {trainerPokemon} = wtrainer.addPokemon(wildPokemon, shinyOdds);
        const caughtAt = trainerPokemon.captureDate;
        wtrainer = await Trainers.findByIdAndUpdate({ _id: wtrainer._id},{ $push: { pokemon: trainerPokemon }, $set: {"cooldowns.pokecatch": caughtAt+cooldown} }, {new: true}).exec();
        const shiny = trainerPokemon.shiny;
        const img2 = shiny ? await Canvas.loadImage(imgPath+wildPokemon.imgs.shiny) : await Canvas.loadImage(imgPath+wildPokemon.imgs.normal);
        ctx.drawImage(img2, 20, 20);
        const attachment2 = new Discord.MessageAttachment(canvas.toBuffer(), 'wild-' + wildPokemon.name + '.png');
        embed2.setDescription('<@' + winner.id + '> caught a ' + pokemonName + '! Use `r!latest` to see your most recent Pokémon.').setTimestamp().setTitle('Pokémon Caught!').setAuthor(winner.username, winner.displayAvatarURL()).setFooter('Use `r!dex` to see all the Pokémon you\'ve discovered.','https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
        channel.send({files: [attachment2], embed: embed2});
        await PokeSpawns.create({
          id: wildPokemon.id,
          name: wildPokemon.name,
          escaped: false, // whether or not it escaped
          legend: wildPokemon.legend, // whether or not the pokemon was legendary
          source: "wild",
          time: caughtAt, // unix time of escape/capture
          guild: channel.guild.id, // server ID on discord where it appeared
          catcherID: winner.id, // discord id of user who caught pokemon
          shiny: shiny
        });
        if (shiny) {
          channel.send('Something looks a little different about this Pokémon... ✨\n`This Pokémon is shiny. Currently, the sprites are work-in-progess, but you can still feel cool about it!`')
        }
        nextSpawn(channel,minDelay+Math.floor(Math.random()*randomDelay));
    } catch (err) {console.error(err)}
    })
    .catch( async (collected) => {
      ctx.drawImage(pokemonIMG, 20, 20);
      const attachment2 = new Discord.MessageAttachment(canvas.toBuffer(), 'wild-' + wildPokemon.name + '.png');
      embed2.setDescription('Oh no... the wild Pokémon excaped before anyone could catch it... It was a ' + pokemonName + '.').setTimestamp().setTitle('Wild '+pokemonName+' Fled').setFooter('Better luck next time...','https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
      channel.send({files: [attachment2], embed: embed2});
      const spawnData = await PokeSpawns.create({
        id: wildPokemon.id,
        name: wildPokemon.name,
        escaped: true, // whether or not it escaped
        shiny: false,
        legend: wildPokemon.legend, // whether or not the pokemon was legendary
        source: "wild",
        time: (new Date()).getTime(), // unix time of escape/capture
        guild: channel.guild.id // server ID on discord where it appeared
      });
      nextSpawn(channel,minDelay+Math.floor(Math.random()*randomDelay));
    });
  })
}

module.exports = {
  name: 'pokemon', // The name of the interval
  description: 'Who\'s that Pokémon?', // The description of the interval (for help text)
  execute: async function(channel,firstDelay) {
    await nextSpawn(channel,firstDelay);
  }
};
