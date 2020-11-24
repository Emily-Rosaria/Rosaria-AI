const fetch = require('node-fetch'); // This lets me get stuff from api.
const Discord = require('discord.js'); // Image embed
const { pokemon } = require('./../../config.json'); // Pokemon config

module.exports = {
    name: 'pokelookup', // The name of the command
    description: 'Get a data card of a Pokémon by its name or ID! Input \'random\' or \'0\' to get a random Pokémon instead.', // The description of the command (for help text)
    aliases: ['getpokemon','get-pokemon','dexsearch','fetch-pokemon','fetchpokemon','pokemonfetch','pokemon-fetch','dex-search','search-dex','searchdex','ds','pf','fp','poke'],
    perms: 'verified', //restricts to users with the "verifed" role noted at config.json
    usage: '<pokemon-name OR pokemon-id>', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {
        const query = (args.length == 0 || args[0] == 'random' || args[0] == 'r' || args[0] == '0') ? (Math.ceil(Math.random() * pokemon.count).toString()) : args.join('-').toLowerCase();
        const nameidTemp = {
          name: (isNaN(query) ? query : '??????'),
          id: (!isNaN(query) ? query : '')
        }
        const { id, name, sprites, abilities, types, height, weight } = await fetch('https://pokeapi.co/api/v2/pokemon/' + query).then(response => response.json()).catch(function(error) {
          console.error(error);
        }) || {id: nameidTemp.id, name: nameidTemp.name, sprites: '', types: '', height: 0, weight: 0, abilities: ''};
        const pokemonName = name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
        const pokemonImage = (sprites == '') ? 'https://cdn.dribbble.com/users/621155/screenshots/2835314/simple_pokeball.gif' : sprites.other["official-artwork"].front_default;
        const pokemonAbilities = (abilities == '') ? ['unknown'] : abilities.map(ability => ability.ability.name.split(' ').map(word => (word[0].toUpperCase() + word.slice(1))).join(' '));
        const pokemonTypes = (types == '') ? ['???'] : types.map(type => type.type.name);
        const pokemonID = (id == '') ? '???' : id.toString();
        const pokemonHeight = (10 <= height) ? height.toString().slice(0,-1) + '.' + height.toString().slice(-1) + ' m': '0.' + height.toString() + ' m';
        const pokemonWeight = (10 <= weight) ? weight.toString().slice(0,-1) + '.' + height.toString().slice(-1) + ' kg': '0.' + height.toString() + ' kg';
        console.log('Got: #'+pokemonID+' '+pokemonName);
        const embed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Pokedex Entry #'+pokemonID+' - '+pokemonName)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setDescription(pokemonName+" is a "+pokemonTypes.join('/')+" type Pokémon.")
          .setThumbnail('https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
          .addField('Pokémon Abilities',pokemonName+' can have the following abiliies: '+pokemonAbilities.join(', ')+'.',false)
          .addField('Height',pokemonHeight,true)
          .addField('Weight',pokemonWeight,true)
          .setImage(pokemonImage)
          .setTimestamp()
          .setFooter('Keep training and one day you\'ll catch \'em all!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
        message.channel.send(embed);
    },
};