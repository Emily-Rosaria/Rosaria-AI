const Trainers = require('./../../database/models/trainers.js');

module.exports = {
  name: 'removepokemon', // The name of the command
  description: 'Takes a bunch of Pokémon away from the target.', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  aliases: ['purgepokemon'],
  allowDM: true,
  args: 2,
  usage: '<user> <pokemonIDs>',
  async execute(message, args) {
    user = !!args[0] ? message.client.users.cache.get(args[0].match(/\d+/)[0]) || message.author : message.author;
    //const recursive = (args[0] === "true" || args[1] === "true" || args[0] === "recursive" || args[1] === "recursive") ? true : false;
    var trainer = await Trainers.findById(user.id).exec();
    const toTake = args.map((a)=>a.replace(/[.#+"':;]/g,"").toLowerCase());
    let removed = [];
    trainer = trainer.pokemon.filter(p=>{
      if (removed.includes(p.id)) {return true}
      else if (toTake.includes(p.id.toString())) {
        removed.push(p.id);
        return false;
      } else if (toTake.includes(p.name)) {
        removed.push(p.id);
        return false;
      } else {
        return true;
      }
    });
    trainer = await trainer.save();
    message.reply('Done! One of each Pokémon with the following IDs have been removed:\n```\n'+removed+'\n```');
  },
};
