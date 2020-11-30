const GuildData = require('./../../database/models/guilds.js');

module.exports = {
  name: 'lurkers', // The name of the command
  aliases: ['getlurkers'],
  description: 'Add members without a role to the lurker list!', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  args: false,
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    var client = message.client;
    const guild = message.guild;
    const guildConfig = await GuildData.findById(message.guild.id).exec();
    if (!guildConfig || !guildConfig.lurkers || guildConfig.lurkers.length == 0) {message.reply("This guild has no logged lurkers."); return;}
    const lurkers = guildConfig.lurkers.map(L=>`<@${L._id}> - ${L.warnings}`);
    message.reply("This guild has the following lurkers:\n>>> "+lurkers.join('\n'));
  },
};
