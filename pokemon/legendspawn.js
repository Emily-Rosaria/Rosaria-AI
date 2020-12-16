const Canvas = require('canvas'); // Drawings
const Discord = require('discord.js'); // Image embed
const Trainers = require('./../database/models/trainers.js');
const Pokedex = require('./../database/models/pokedex.js');
const GuildData = require('./../database/models/guilds.js');
const PokeSpawns = require('./../database/models/spawnedpokemon.js');

async function giveLegend(user, trainer, legend, shinyOdds, channel, canvas, ctx) {
  try {
    const {trainerPokemon} = trainer.addPokemon(legend, shinyOdds);
    const caughtAt = trainerPokemon.captureDate;
    const pokemonName = trainerPokemon.nickname;
    const cooldown = channel.client.pokeConfig.get("cooldown");
    await Trainers.findByIdAndUpdate({ _id: trainer._id},{ $push: { pokemon: trainerPokemon }, $set: {"cooldowns.pokecatch": caughtAt+cooldown} }, {new: true}).exec();
    const shiny = trainerPokemon.shiny;
    const imgPath = channel.client.pokeConfig.get("imgPath");
    const pokemonIMG = shiny ? await Canvas.loadImage(imgPath+legend.imgs.shiny) : await Canvas.loadImage(imgPath+legend.imgs.normal);
    ctx.drawImage(pokemonIMG, 20, 20);
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'legendary-' + wildPokemon.name + '.png');
    const embed = new Discord.MessageEmbed()
      .setColor('#FF0000')
      .setImage('attachment://legendary-' + legend.name + '.png')
      .setDescription('<@' + user.id + '> caught a ' + pokemonName + '! Use `r!latest` to see your most recent Pokémon.')
      .setTimestamp()
      .setTitle('Legendary Pokémon Caught!')
      .setAuthor(user.username, user.displayAvatarURL())
      .setFooter('Use `r!dex` to see all the Pokémon you\'ve discovered.','https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')

    channel.send({files: [attachment], embed: embed});
    await PokeSpawns.create({
      id: legend.id,
      name: legend.name,
      escaped: false, // whether or not it escaped
      legend: true, // whether or not the pokemon was legendary
      source: "wild",
      time: caughtAt, // unix time of escape/capture
      guild: channel.guild.id, // server ID on discord where it appeared
      catcherID: user.id, // discord id of user who caught pokemon
      shiny: shiny
    });
    if (shiny) {
      channel.send('Something looks a little different about this Pokémon... ✨')
    }
    guildInfo = await GuildData.findByIdAndUpdate(channel.guild.id,{"$set": {"pokeData.legendSpawns": [], "pokeData.legend": 0} },{new: true}).exec();
  } catch (err) {console.error(err)}
}

async function giveEgg(trainer, shinyOdds) {
  try{
    const eggPoke = await Pokedex.randomEgg(Math.random());
    const trainerEgg = {
      id: eggPoke.id, //pokedex Number of the pokemon it will be
      dateObtained: (new Date()).getTime(), // unix time of capture
      shinyOdds: shinyOdds, // shiny chance, as a decimal
      inclubating: false, // if the egg is being incubated
      startedIncubating: -1 // when incubation began, unix time, -1 if never started
    };
    if (trainer.eggs && trainer.eggs.length > 0) {
      await Trainers.findByIdAndUpdate(trainer.id, { $push: { eggs: trainerEgg }});
    } else {
      await Trainers.findByIdAndUpdate(trainer.id, { $set: { eggs: [trainerEgg] }});
    }
  } catch (err) {console.error(err)}
}

async function giveChoice(user, trainer, guildInfo, shinyOdds, channel) {
  const cooldown = channel.client.pokeConfig.get("cooldown");
  let pokeChoices = await Pokedex.randomWilds([Math.random(),Math.random(),Math.random()],false);
  let pokeNames = pokeChoices.map(p=>p.name);
  let imgs = pokeChoices.map(p=>p.imgs); // each is 475x475
  const imgPath = channel.client.pokeConfig.get("imgPath");
  const grassCanvas = Canvas.createCanvas(1030, 640);
  const grassCtx = grassCanvas.getContext('2d');
  const grassBackground = await Canvas.loadImage('./bot_assets/background-grass.png');
  grassCtx.drawImage(grassBackground, 0, 0, grassCanvas.width, grassCanvas.height);
  const mysteryPokes = Canvas.createCanvas(1030, 640);
  const shadowCtx = mysteryPokes.getContext('2d');
  const poke1 = await Canvas.loadImage(imgPath+imgs[0].normal);
  shadowCtx.drawImage(poke1, 20, 177, 285, 285);
  const poke2 = await Canvas.loadImage(imgPath+imgs[1].normal);
  shadowCtx.drawImage(poke2, 372, 177, 285, 285);
  const poke3 = await Canvas.loadImage(imgPath+imgs[2].normal);
  shadowCtx.drawImage(poke3, 724, 177, 285, 285);
  shadowCtx.globalCompositeOperation = 'source-in';
  shadowCtx.fillRect(0, 0, 1030, 640);
  grassCtx.drawImage(mysteryPokes, 0, 0);
  const groupAttachment = new Discord.MessageAttachment(grassCanvas.toBuffer(), 'mystery-pokemon-group-encounter.png');
  const groupEmbed = new Discord.MessageEmbed()
    .setColor('#FF0000')
    .setDescription("Woah! The other Pokémon escaped, but while chasing it you ran into three other Pokémon. If you're quick, you might be able to catch one. Just say their name to give it a shot!")
    .setImage('attachment://mystery-pokemon-group-encounter.png')
    .setTimestamp()
    .setTitle('Wild Pokémon Ambush!')
    .setFooter('Hurry up before they get the best of you!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
  channel.send({content: `<@${user.id}>`, files: [groupAttachment], embed: groupEmbed}).then(()=> {
    const multiFilter = (m) => {
      if (user.id != m.author.id) {return false} else {return true}
    }
    channel.awaitMessages(multiFilter, { max: 1, time: 120000, errors: ['time'] })
    .then( async (collected) => {
      const msg = collected.first();
      let wildPokemon = false;
      let xPos = 0;
      let choiceNum = -1;
      let loadedImg = false;
      for (var i in pokeNames) {
        const cleamMSG = msg.content.toLowerCase().replace(/[ \-.'":]/gi, '');
        const cleanName = pokeNames[i].replace('-','');
        if (cleamMSG.startsWith(cleanName) && (wildPokemon == false || wildPokemon.name.length < pokeNames[i].length)) {
          wildPokemon = pokeChoices[i];
          xPos = 20 + i*352;
          choiceNum = i;
        }
      }
      if (wildPokemon == false) {
        const escapeEmbed = new Discord.MessageEmbed()
          .setColor('#FF0000')
          .setTitle('Pokémon Flee...')
          .setDescription("You try to catch one, but with three wild Pokémon to focus on instead of one, you fail. They all run circles around you and before long, you're lost. Better luck next time.")
          .setThumbnail('https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
          .setTimestamp()
          .setFooter('Keep training and one day you\'ll catch \'em all!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
        channel.send({content: `<@${user.id}>`, embed: escapeEmbed});
      } else {
        try {
          const {trainerPokemon} = trainer.addPokemon(wildPokemon, shinyOdds);
          const pokemonName = trainerPokemon.nickname;
          const caughtAt = trainerPokemon.captureDate;
          const newTrainer = await Trainers.findByIdAndUpdate({ _id: trainer._id},{ $push: { pokemon: trainerPokemon }, $set: {"cooldowns.pokecatch": caughtAt+cooldown} }, {new: true}).exec();
          const shiny = trainerPokemon.shiny;
          const finalImg = shing ? await Canvas.loadImage(imgPath+imgs[choiceNum].shiny) : await Canvas.loadImage(imgPath+imgs[choiceNum].normal);
          grassCtx.drawImage(finalImg, xPos, 177, 285, 285);
          const catchFile = new Discord.MessageAttachment(grassCanvas.toBuffer(), 'caught-'+wildPokemon.name+'-group.png');
          const catchEmbed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setDescription('<@' + user.id + '> caught a ' + pokemonName + ' despite all the chaos! Use `r!latest` to see your most recent Pokémon.')
            .setImage('attachment://caught-'+wildPokemon.name+'-group.png')
            .setTimestamp()
            .setTitle('Pokémon Caught!')
            .setAuthor(user.username, user.displayAvatarURL())
            .setFooter('Use `r!dex` to see all the Pokémon you\'ve discovered.','https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
          channel.send({embed: catchEmbed, files: [catchFile]});
          await PokeSpawns.create({
            id: wildPokemon.id,
            name: wildPokemon.name,
            escaped: false, // whether or not it escaped
            legend: false, // whether or not the pokemon was legendary
            source: "wild",
            time: caughtAt, // unix time of escape/capture
            guild: channel.guild.id, // server ID on discord where it appeared
            catcherID: user.id, // discord id of user who caught pokemon
            shiny: shiny
          });
          if (shiny) {
            channel.send('Something looks a little different about this Pokémon... ✨');
          }
        } catch (err) {console.error(err)}
      }
    })
    .catch (()=> {
      const escapeEmbed = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Pokémon Flee...')
        .setDescription("You're unable to build an advantage in time, and the wild Pokémon all run circles around you. Better luck next time.")
        .setThumbnail('https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
        .setTimestamp()
        .setFooter('Keep training and one day you\'ll catch \'em all!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
      channel.send({content: `<@${user.id}>`, embed: escapeEmbed});
    });
  });
}

async function giveTokens(trainer) {
  const awardTokens = Math.ceil(3*Math.random()*Math.random());
  let newTrainer = trainer;
  if (trainer.currency) {
    if (trainer.currency.has("tokens")) {
      newTrainer = await Trainers.findByIdAndUpdate(trainer.id, { "$inc": { "currency.tokens": awardTokens }},{new: true});
    } else {
      newTrainer = await Trainers.findByIdAndUpdate(trainer.id, { "$set": { "currency.tokens": awardTokens }},{new: true});
    }
  } else {
    const tokenMap = new Map();
    tokenMap.set("tokens",awardTokens);
    newTrainer = await Trainers.findByIdAndUpdate(trainer.id, { "$set": { "currency": tokenMap }},{new: true});
  }
  const newTokens = newTrainer.currency.get("tokens");
  return [awardTokens, newTokens];
}

module.exports = async function (wildPokemon, guildInfo, channel) {
  const PokemonSpawn = require('./pokemon.js');
  var pokemonName = wildPokemon.name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
  const minDelay = channel.client.pokeConfig.get("minDelay");
  const randomDelay = channel.client.pokeConfig.get("randomDelay");
  const imgPath = channel.client.pokeConfig.get("imgPath"); // external image host path
  const nextDelay = minDelay+Math.floor(Math.random()*randomDelay);
  const startTime = (new Date()).getTime();
  const pokemonURL = imgPath+wildPokemon.imgs.normal;
  const lingerTime = channel.client.pokeConfig.get("lingerTime");
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
  const attachment2 = new Discord.MessageAttachment(canvas.toBuffer(), 'legendary-' + wildPokemon.name + '.png');
  const embed1 = new Discord.MessageEmbed()
    .setColor('#FF0000')
    .setDescription("Who\'s that Pokémon? Say its name to throw a pokeball and catch it! Be wary... it looks powerful!")
    .setImage('attachment://mystery-pokemon-encounter.png')
    .setTimestamp()
    .setTitle('A wild Pokémon appears... It has a mysterious aura about it...')
    .setFooter('Hurry up before it gets away!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');

  // Legendary catch chance
  const catchChance = !!guildInfo.pokeData.legendSpawns && guildInfo.pokeData.legendSpawns.length > 0 ? Math.random() > 0.15 + (0.8 ** guildInfo.pokeData.legendSpawns.length) : Math.random() > 0.95;

  channel.send({files: [attachment1], embed: embed1})
  .then( () => {
    const filter = async (m) => {
      if (!(m.content.toLowerCase().replace(/[ \-.'":]/gi, '').startsWith(wildPokemon.name.replace('-','')))) { return false; }
      const trainer = await Trainers.findById(m.author.id).exec();
      if (!trainer || !trainer.pokemon || trainer.pokemon.length == 0) {
        m.reply("Please register as a Pokémon Trainer before venturing into the tall grass. You can do so by using the `r!starter` or `r!register` commands.");
        return false;
      } else {
        return true;
      }
    }
    channel.awaitMessages(filter, { max: 1, time: lingerTime, errors: ['time'] })
    .then( async (collected) => {
      const winner = collected.first().author;
      let wtrainer = await Trainers.findById(winner.id).exec();
      const random = Math.random();
      if (catchChance) {
        await giveLegend(winner, wtrainer, wildPokemon, shinyOdds, channel, canvas, ctx);
      } else if (random<0.25) {
        giveEgg(wtrainer, shinyOdds*2);
        const eggCanvas = Canvas.createCanvas(806, 991);
        const ctxEgg = eggCanvas.getContext('2d');
        const eggImg = await Canvas.loadImage('./bot_assets/pokemon_egg.png');
        ctxEgg.drawImage(eggImg, 0, 0, eggCanvas.width, eggCanvas.height);
        const eggAttachment = new Discord.MessageAttachment(eggCanvas.toBuffer(), 'mystery-egg.png');
        const eggEmbed = new Discord.MessageEmbed()
          .setColor('#FF0000')
          .setDescription("As the winds part, you notice an egg on the group. A Pokémon egg. <@"+winner.id+"> has found a mystery egg!")
          .setImage('attachment://mystery-egg.png')
          .setTimestamp()
          .setTitle('The Mysterious Pokémon flees... but something is left behind!')
          .setFooter('Use `r!eggs` to view your eggs!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
        channel.send({files: [eggAttachment], embed: eggEmbed});
      } else if (random<0.7) {
        await giveChoice(winner, wtrainer, guildInfo, shinyOdds, channel, "./../");
      } else { // tokens
        try {
          const tokens = await giveTokens(wtrainer);
          const tokenEmbed = new Discord.MessageEmbed()
            .setColor('#FFA500')
            .setDescription("The Wild Pokémon flees... but the experience earns <@"+winner.id+"> **`"+tokens[0]+"`** tokens. They now have **`"+tokens[1]+"`** tokens! Use `r!bal` to check your token balance, and use `r!shop` and `r!buy` to view and use the shop.")
            .setTimestamp()
            .setTitle('Tokens Found!')
            .setFooter('Keep on training and maybe you\'ll catch it next time!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
          channel.send(tokenEmbed);
        } catch (err) {
          console.error(err);
        }
      }
      PokemonSpawn.execute(channel,nextDelay);
    })
    .catch( async (collected) => {
      const embed2 = new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setTimestamp()
        .setDescription('Oh no... the wild Pokémon excaped before anyone could catch it... I wonder what it could have been...')
        .setTimestamp()
        .setTitle('Wild Pokémon Fled')
        .setFooter('Better luck next time...','https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
        .setImage('attachment://mystery-pokemon-encounter.png');
      channel.send({files: [attachment1], embed: embed2});
      PokemonSpawn.execute(channel,nextDelay);
    });
  });
}
