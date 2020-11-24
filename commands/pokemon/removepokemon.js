const fetch = require('node-fetch'); // This lets me get stuff from api.
const { pokemon } = require('./../../config.json'); // Pokemon config

module.exports = {
  name: 'removepokemon', // The name of the command
  description: 'Takes a bunch of Pokémon away from the target.', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  database: true,
  aliases: ['purgepokemon'],
  args: true,
  usage: '<user> <pokemonIDs>',
  async execute(message, db, args) {
    user = !!args[0] ? message.client.users.cache.get(args[0].match(/\d+/)[0]) || message.author : message.author;
    const pokeJSON = await db.get("poke_"+user.id).then((pokedex) => JSON.parse(pokedex)).catch(() => {});
    const { results } = await fetch('https://pokeapi.co/api/v2/pokemon?limit=' + pokemon.count).then(response => response.json());
    const toTake = args.map((a)=>{
      const id = a.match(/\d+/);
      if (id != null) {
        return id[0];
      } else {
        const name = a.match(/[\w-]+/);
        if (name != null) {
          return name[0].toLowerCase();
        } else {
          return "0";
        };
      }
    });
    const takes = results.filter((poke, index) => toTake.includes(poke.name) || toTake.includes((index+1).toString())).map((cur)=>{
      return cur.url.match(/\d+/g).slice(-1)[0];
    });
    let newJSON = pokeJSON;
    const keys = Object.keys(newJSON);
    for (const key of keys) {
      if (toTake.includes(key.split('_')[0])) {
        delete newJSON[key];
      }
    }
    console.log(newJSON);
    await db.set("poke_" + user.id, JSON.stringify(newJSON));
    message.reply('Done! Pokemon have been removed.');
  },
};