const GuildData = require('./../../database/models/guilds.js');

module.exports = {
  name: 'perms', // The name of the command
  aliases: ['setperms'],
  description: 'Add members without a role to the lurker list!', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  usage: '<lurkerIDs>', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    var client = message.client;
    const guild = message.guild;
    const guildConfig = await GuildData.findByIdAndUpdate(guild.id,{"lurkers": [],"perms.purge": 3, "perms.spectator":['776927641789661204']},{new: true}).exec();
    console.log(guildConfig);
  },
};
