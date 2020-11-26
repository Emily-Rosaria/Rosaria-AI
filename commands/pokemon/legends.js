const Trainers = require('./../../database/models/trainers.js');
const Discord = require('discord.js'); // Image embed


module.exports = {
  name: 'legends', // The name of the command
  description: 'Gets a list of users with legendary pokemon!', // The description of the command (for help text)
  args: false, // Specified that this command doesn't need any data other than the command
  perms: 'basic',
  allowDM: true,
  cooldown: 30,
  aliases: ['getlegends'],
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    var data = await Trainers.find({pokemon: {legendary: true}}).exec();
    var msg = "";
    if (data != null) {
      for (const d of data) {
        msg = msg + "<@" + d.id + "> has captured:\n"+d.legends.map((t)=>"> #"+t.id+" "+t.name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-')).join('\n')+'\n';
      }
    } else {
      msg = "Looks like this list is empty...";
    }
    const embed = new Discord.MessageEmbed()
    .setColor('#ff0000')
    .setTitle('The Legendary Crew')
    .setDescription(msg)
    .setTimestamp()
    .setFooter('Requested by '+message.author.username+'#'+message.author.discriminator,message.author.displayAvatarURL());
    message.channel.send(embed);
  },
};
