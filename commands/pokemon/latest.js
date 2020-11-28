const Trainers = require('./../../database/models/trainers.js');
const Discord = require('discord.js'); // Image embed
const Pokedex = require('./../../database/models/pokedex.js');

module.exports = {
  name: 'dex', // The name of the command
  description: 'Shows you your Pokédex.', // The description of the command (for help text)
  perms: 'basic',
  allowDM: true,
  aliases: ['pokedex'],
  args: false, // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    var user = message.author;
    var trainer = await Trainers.findById(user.id).exec();
    if (!trainer || !trainer.pokemon || trainer.pokemon.length == 1) {
      return message.reply("You've yet to catch any Pokémon. If you want to get started, use the `r!starter` command.");
    }


    const dexEmbed = new Discord.MessageEmbed()
      .setColor('#3b4cca')
      .setTitle(title)
      .setAuthor(user.username, user.displayAvatarURL())
      .setDescription(desc)
      .setThumbnail('https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png')
      .addField('\u200b',col1,true)
      .addField('\u200b',col2,true)
      .addField('\u200b',col3,true)
      .addField('Total Pokémon',total.toString(),true)
      .addField('Unique Pokémon',unique.toString()+'/'+pokedexSize.toString(),true)
      .addField('Shiny Pokémon',shinies.toString(),true)
      .setTimestamp()
      .setFooter(foot, 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
    message.channel.send(dexEmbed);
  },
};
