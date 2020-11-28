const Trainers = require('./../../database/models/trainers.js');
const Pokedex = require('./../../database/models/pokedex.js');
const Discord = require('discord.js'); // Image embed
const PokeSpawns = require('./../../database/models/spawnedpokemon.js');

module.exports = {
  name: 'starter', // The name of the command
  description: 'Choose a starter Pokémon and begin your journey as a Pokémon trainer!.', // The description of the command (for help text)
  perms: 'basic',
  aliases: ['register'],
  args: false,
  usage: '<starter-pokemon>',
  async execute(message, args) {
    var trainer = await Trainers.findById(message.author.id).exec();
    if (trainer && trainer.pokemon && trainer.pokemon.length > 0) {return message.reply("You've already begun your journey. Try using `r!daily` instead if you'd like to take care of more pokemon.")}
    const starters = [1,4,7,152,155,158,252,255,258,387,390,393];
    const starterPokemon = await Pokedex.find({ _id: { $in: starters }}).exec();
    const starterscreen = require('./../../pokemon/starter-selection.js');
    if (args.length > 0) {
      const filteredNum = Number(args[0].replace(/[\.#'()]/,''));
      const filteredName = args.join('-').replace(/[\.#'()]/,'').toLowerCase();
      let choice = false;
      if (starters.includes(filteredNum)) {
        choice = starterPokemon.filter(p=>p.id == Number(filteredNum))[0];
      } else {
        choice = starterPokemon.filter(p=>p.name == filteredName);
        if (choice.length > 0) {
          choice = choice[0];
        } else {
          choice = false;
        }
      }
      if (!choice) {
        const msg = await message.reply("I'm afraid we don't have that Pokémon available... Why don't you take a look at what we have in stock instead?");
        return await starterscreen(msg, message.author);
      } else {
        const options = {new: true, upsert: true, setDefaultsOnInsert: true, overwrite: true};
        if (trainer) {
          trainer.registrationDate = (new Date()).getTime();
          trainer.pokemon = [];
        } else {
          trainer = await Trainers.create({
            _id: message.author.id, // ID of user on Discord
            registrationDate: (new Date()).getTime(), // unix time of signup/first catch
            pokemon: [] //array of all their pokemon
          });
        }
        const {trainerPokemon} = trainer.addPokemon(choice, 0);
        message.reply("Congratulations! You're now a proud Pokémon trainer. I'm sure you and your "+trainerPokemon.nickname+" will have a great journey together!");
        await trainer.save();
        await PokeSpawns.create({
          id: choice.id,
          name: choice.name,
          escaped: false, // whether or not it was caught
          legend: choice.legend, // whether or not the pokemon was legendary
          shiny: trainerPokemon.shiny,
          source: "starter",
          time: (new Date()).getTime(), // unix time of escape/capture
          guild: message.guild.id, // server ID on discord where it appeared
          catcherID: message.author.id // discord id of user who caught pokemon
        });
      }
    } else {
      const msg = await message.reply("Ah! A new prospective trainer... Why don't you take a look at the Pokémon we have available? I'm sure you'll be able to give one of them a good home!");
      return await starterscreen(msg, message.author);
    }
  },
};
