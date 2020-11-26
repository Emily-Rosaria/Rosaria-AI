const Trainers = require('./../../database/modules/trainers.js');
const Pokedex = require('./../../database/modules/pokedex.js');

module.exports = {
  name: 'recoverpokemon', // The name of the command
  description: 'Gives a user a bunch of Pokémon that they don\'t already have! Namely to recover something for them should the bot not save it.', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  aliases: ['recover','award','awardpokemon'],
  args: true,
  usage: '<user> <pokemonIDs>',
  async execute(message, args) {
    user = !!args[0] ? message.client.users.cache.get(args[0].match(/\d+/)[0]) || message.author : message.author;
    var trainer = await Trainers.findById(user.id).exec();
    const wants = args.map((a)=>a.replace(/[.#+"':;]/g,"").toLowerCase());
    var pokes = await Pokedex.find({}).exec();
    pokes = pokes.filter(p=>wants.includes(p.id) || wants.includes(p.name));
    arr = [];
    for (const poke of pokes) {
      arr.push(poke.id);
      trainer.catchPokemon(poke);
    }
    trainer = await trainer.save();
    message.reply('Done! Maybe this command will have a pretty message later... who knows!');
  },
};
