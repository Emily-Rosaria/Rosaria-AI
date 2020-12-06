const GuildData = require('./../../database/models/guilds.js');

module.exports = {
  name: 'unlurk', // The name of the command
  aliases: ['removelurker','lurkerremove','lurkeremove'],
  description: 'Removes a member from the lurker list!', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  args: 1,
  usage: '<lurkerIDs>', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    var client = message.client;
    const guild = message.guild;
    const guildConfig = await GuildData.findById(message.guild.id).exec();
    if (!guildConfig || !guildConfig.lurkers || guildConfig.lurkers == 0) {message.reply("There are no lurkers registered on this guild."); return;}

    let removed = []; // IDs of users who aren't lurkers
    let notRemoved = []; // IDs of users who left the discord

    args.filter(arg=>arg.match(/\d{10,}/)).map(arg=>arg.match(/\d{10,}/)[0]).forEach(id => {
      if (guildConfig.lurkers.find(L=>L._id == id)) {
        removed.push(id);
        return true;
      } else {
        notRemoved.push(id);
        return false;
      }
    });

    const newGuildConfig = await GuildData.findByIdAndUpdate({_id: guild.id},{"$pull": {"lurkers": {"_id": {"$in": removed}}}},{new: true}).exec();

    if (notRemoved.length > 0) {
      message.reply("The following members were not removed as they could not be found in this guild's lurker list:\n>>> "+notRemoved.map(id => `<@${id}>`).join('\n'));
    }
    if (removed.length > 0) {
      message.reply("The following members were removed as lurkers:\n>>> "+removed.map(id => `<@${id}>`).join('\n'));
    } else {
      message.reply("No valid users were found to be removed as lurkers.");
    }
  },
};
