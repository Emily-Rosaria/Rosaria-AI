const Trainers = require('./../../database/models/trainers.js');
const Pokedex = require('./../../database/models/pokedex.js');
const Discord = require('discord.js'); // Image embed

module.exports = {
  name: 'showstarters', // The name of the command
  description: 'List all the starter Pokémon.', // The description of the command (for help text)
  perms: 'basic',
  aliases: ['liststarters'],
  args: false,
  allowDM: true,
  usage: '',
  async execute(message, args) {
    var trainer = await Trainers.findById(message.author.id).exec();
    const starterscreen = require('./../../pokemon/starter-selection.js');
    if (trainer && trainer.pokemon && trainer.pokemon.length > 0) {
      const msg = await message.reply("Ah... you wish to reminise? I'm afraid we can't hand you another starter Pokémon, but you may still browse the selection.");
      return await starterscreen(msg, message.author);
    } else {
      const msg = await message.reply("Ah! A new prospective trainer... Why don't you take a look at the Pokémon we have available? I'm sure you'll be able to give one of them a good home!");
      return await starterscreen(msg, message.author);
    }
  },
};
