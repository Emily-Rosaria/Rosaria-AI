const Canvas = require('canvas'); // Drawings
const Discord = require('discord.js'); // Image embed
const Trainers = require('./../../database/modules/trainers.js');
const Pokedex = require('./../../database/modules/pokedex.js');
const PokeSpawns = require('./../../database/modules/spawnedpokemon.js');

module.exports = {
  name: 'daily', // The name of the command
  description: 'Gives you your daily bonus! Bonuses include:\n> A free Pokémon roll, with increased odds of rolling one you haven\'t caught before. Only generates legendaries if all other Pokémon have been obtained. Increased shiny chance for those with a full Pokédex.\n> A chance to win tokens, which can be redeemed at the shop.\nClaims reset at midnight UTC time.', // The description of the command (for help text)
  args: false, // Specified that this command doesn't need any data other than the command
  allowDM: false,
  perms: 'advanced',
  reject: 'Please write an introduction over at <#729760752898146336> to gain access to this command!',
  cooldown: 15,
  aliases: ['dailybonus','dailyclaim'],
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    user = message.author;
    trainer = await Trainers.findById(user.id).exec();
    if (!trainer) {
      return message.reply("Please register as a Pokémon Trainer before using this command. You can do so by using `r!starter` or `r!register`.");
    }
    const dailyTimer = trainer.cooldowns.daily ? trainer.cooldowns.daily : 1;
    const now = new Date();
    const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
    if (dailyTimer > now.getTime()) {
      trainer.cooldowns.daily = now.getTime();
      const {dailyPokemon, unique, tier} = await Pokedex.randomDaily(trainer);
      const shinychance = (tier+1)*message.client.pokeConfig.shinyOdds;
      const legendaryCatch = dailyPokemon.legend;
      const {trainerPokemon, newCount} = trainer.addPokemon(dailyPokemon, shinychance);
      const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Daily Roulette!')
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setDescription('Stay tuned while we fetch your daily bonus Pokémon! Your Pokémon will be sent to you shortly...')
        .setImage('https://cdn.dribbble.com/users/621155/screenshots/2835314/simple_pokeball.gif')
        .setTimestamp()
        .setFooter('Fetching Pokémon...', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
      await message.channel.send(embed).then( async (msg) => {
        setTimeout( async (message) => {
          await message.reply('Contacting the Pokémon Trading Centre...');
        }, 2500, message);
        setTimeout(async (message,unique) => {
          if (unique) {
            await message.reply('Get ready to update your Pokédex!');
          } else {
            await message.reply('We think you\'ll be familiar with this one!');
          }
        }, 5000, message, unique);
        setTimeout(async (message,legendaryCatch) => {
          if (legendaryCatch) {
            await message.reply('Boy is this one special! We didn\'t know they just gave these things away...');
          } else {
            await message.reply('We think you might have heard of it before!');
          }
        }, 7500, message,legendaryCatch);
        setTimeout(async (message, msg, trainerPokemon) => {
          const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Daily Pokémon: #'+trainerPokemon.id+' '+trainerPokemon.name+'!')
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setDescription('Wow, <@'+message.author.id+'> just recieved a '+trainerPokemon.name+' from the daily Pokémon roulette!')
            .setImage(trainerPokemon.img)
            .setTimestamp()
            .setFooter('Use `r!dex` to see all the Pokémon you\'ve discovered.', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
          await msg.edit(embed);
          shinyText = trainerPokemon.shiny ? '\n... wait a second! Something looks a little different about this Pokémon... ✨\n`This Pokémon is shiny. Currently, the sprites are work-in-progess, but you can still feel cool about it!`' : '';
          await message.reply('Your Pokémon has arrived! We hope '+trainerPokemon.name+' has a good time in your care.'+shinyText);
          await trainer = trainer.save();
          await PokeSpawns.create({
            id: trainerPokemon.id,
            name: trainerPokemon.name,
            escaped: false, // whether or not it was caught
            legend: trainerPokemon.legend, // whether or not the pokemon was legendary
            shiny: trainerPokemon.shiny,
            source: "daily",
            time: new Date().getTime(), // unix time of escape/capture
            guild: message.guild.id, // server ID on discord where it appeared
            catcherID: message.author.id // discord id of user who caught pokemon
          });

          if (!shiny) {
            console.log(message.author.username+" claimed a "+trainerPokemon.name+ " for their daily bonus at "+message.channel.guild.name)
          } else {
            console.log(message.author.username+" claimed a SHINY "+trainerPokemon.name+ " for their daily bonus at "+message.channel.guild.name)
          }
        }, 10000, message, msg, trainerPokemon);
      }).catch ((err) => {console.error(err); message.reply('Something went wrong...')})
    } else {
      const timeDiff = dailyTimer - now.getTime();
      const toDuration = require('./../../misc_functions/toDuration.js');
      message.reply('You can\'t claim for roughly `'+toDuration(timeDiff)+'`.`');
    }
  },
};
