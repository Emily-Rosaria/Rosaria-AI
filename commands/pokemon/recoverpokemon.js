const fetch = require('node-fetch'); // This lets me get stuff from api.
const { pokemon } = require('./../../config.json'); // Pokemon config

module.exports = {
  name: 'recoverpokemon', // The name of the command
  description: 'Gives a user a bunch of Pokémon that they don\'t already have! Namely to recover something for them should the bot not save it.', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  database: true,
  aliases: ['recover','award'],
  args: true,
  usage: '<user> <pokemonIDs>',
  async execute(message, db, args) {
    user = !!args[0] ? message.client.users.cache.get(args[0].match(/\d+/)[0]) || message.author : message.author;
    const pokeJSON = await db.get("poke_"+user.id).then((pokedex) => JSON.parse(pokedex)).catch(() => {});
    const { results } = await fetch('https://pokeapi.co/api/v2/pokemon?limit=' + pokemon.count).then(response => response.json());
    const wants = args.map((a)=>{
      const clean = a.replace(/[.+"':;]/g,"")
      const id = clean.match(/\d+/);
      if (id != null) {
        return id[0];
      } else {
        const name = clean.match(/[\w-]+/);
        if (name != null) {
          return name[0].toLowerCase();
        } else {
          return "0";
        };
      }
    });
    const gets = results.filter((poke, index) => wants.includes(poke.name) || wants.includes((index+1).toString()));
    const newJSON = gets.reduce((acc,cur,index)=>{
      let id = cur.url.match(/\d+/g);
      id = id[id.length-1];
      const name = cur.name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
      let tempJ = acc;
      tempJ[id+'_'+name] = {"normal":1,"shiny":0};
      return tempJ;
    },pokeJSON);
    await db.set("poke_" + user.id, JSON.stringify(pokeJSON));
    message.reply('Done! Maybe this command will have a pretty message later... who knows!');
  },
};