const GuildData = require('./../../database/models/guilds.js');

module.exports = {
  name: 'permsdump', // The name of the command
  aliases: [],
  description: '', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    const guild = message.guild;
    const guildConfigs = await GuildData.find({}).exec();
    console.log(guildConfigs);
  },
};
