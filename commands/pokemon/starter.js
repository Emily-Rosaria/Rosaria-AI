const Trainers = require('./../../database/models/trainers.js');

module.exports = {
  name: 'starter', // The name of the command
  description: 'Choose a starter Pokémon and begin your journey as a Pokémon trainer!.', // The description of the command (for help text)
  perms: 'basic',
  aliases: ['register'],
  args: 2,
  usage: '<user> <pokemonIDs>',
  async execute(message, args) {
    const starters = [1,4,7,152,155,158,252,255,258,387,390,393];

  },
};
