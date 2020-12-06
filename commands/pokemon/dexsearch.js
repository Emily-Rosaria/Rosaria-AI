const Discord = require('discord.js'); // Image embed
const Trainers = require('./../../database/models/trainers.js');
const Pokedex = require('./../../database/models/pokedex.js');

module.exports = {
    name: 'dexsearch', // The name of the command
    description: 'Get a data card of a Pokémon by its name or ID! Input \'random\' or \'0\' to get a random Pokémon instead.', // The description of the command (for help text)
    aliases: ['getpokemon','dexsearch','fetchpokemon','pokemonfetch','searchdex','ds'],
    perms: 'basic', //restricts to users with the "verifed" role noted at config.json
    allowDM: true,
    usage: '<pokemon-name OR pokemon-id>', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {
      const imgPath = message.client.pokeConfig.get("imgPath");
      const pokeCount = await Pokedex.countDocuments({});
      let query = (args.length == 0 || args[0] == 'random' || args[0] == 'r' || args[0] == '0') ? (Math.ceil(Math.random() * pokeCount)) : (isNaN(args.join('-')) ? args.join('-').toLowerCase() : Number(args[0]));
      const noResult = isNaN(query) ? {name: query, id: "#???"} : {name: "??????", id: ("#"+query)}
      const pokemon = isNaN(query) ? await Pokedex.findOne({name: query}).exec() : await Pokedex.findById(query).exec();
      const trainer = await Trainers.findById(message.author.id).exec();

      const pokemonName = pokemon ? pokemon.name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-') : noResult.name;
      const pokemonImage = pokemon ? imgPath + pokemon.imgs.normal : 'https://cdn.dribbble.com/users/621155/screenshots/2835314/simple_pokeball.gif';
      const pokemonAbilities = pokemon ? pokemon.abilities.map((ability) => ability.name.split(' ').map(word => (word[0].toUpperCase() + word.slice(1))).join(' ')) : ["`[unknown]`"];
      const pokemonTypes = pokemon ? pokemon.types : ['???','???'];
      const pokemonID = pokemon ? pokemon.id : noResult.id;
      const pokemonHeight = pokemon ? pokemon.height.toString()+'m' : '???';
      const pokemonWeight = pokemon ? pokemon.weight.toString()+'kg' : '???';
      const pokemonDesc = pokemon ? pokemon.description : '??? ??? ???';
      const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Pokédex Entry #'+pokemonID+' - '+pokemonName)
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setThumbnail('https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
        .addField('Pokémon Abilities',pokemonName+' can have the following abiliies: '+pokemonAbilities.join(', ')+'.',false)
        .addField('Pokédex Data',pokemonDesc,false)
        .addField('Height',pokemonHeight,true)
        .addField('Weight',pokemonWeight,true)
        .setImage(pokemonImage)
        .setTimestamp()
        .setFooter('Keep training and one day you\'ll catch \'em all!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
      const legendText = pokemon ? (pokemon.legend ? "legendary " : "") : "";
      if (trainer && trainer.pokemon && trainer.pokemon.length > 0) {
        const caught = trainer.pokemon.filter(p=>p.id==pokemonID);
        if (caught.length > 0) {
          if (caught.length > 1) {
            const sort = caught.sort((p1,p2)=>p1.captureDate - p2.captureDate);
            const caughtTime = new Date(sort[0].captureDate);
            embed.setDescription(pokemonName+" is a "+legendText+pokemonTypes.join('/')+" type Pokémon. You first caught this pokemon on `"+caughtTime.toDateString()+"`.");
          } else {
            const caughtTime = new Date(caught[0].captureDate);
            embed.setDescription(pokemonName+" is a "+legendText+pokemonTypes.join('/')+" type Pokémon. You caught this pokemon on `"+caughtTime.toDateString()+"`.");
          }
        } else {
          embed.setDescription(pokemonName+" is a "+legendText+pokemonTypes.join('/')+" type Pokémon. Keep searching and you'll catch it one day...");
        }
      } else {
        embed.setDescription(pokemonName+" is a "+legendText+pokemonTypes.join('/')+" type Pokémon.");
      }
      message.channel.send(embed);
    },
};
