const GuildData = require('./../database/models/guilds.js');

module.exports = {
    name: 'prune', // The name of the command
    aliases: ['purge'],
    description: 'Warns members without a role on a server to get verified or get kicked!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    usage: '<channel-to-post-in>', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {
      var client = message.client;
      const guildConfig = await GuildData.findById(message.guild.id).exec();
      if (!guildConfig || !guildConfig.perms || guildConfig.perms.allowAll === true || (guildConfig.perms.basic.length == 0 && guildConfig.perms.advanced.length == 0)) {return message.reply("This command is only valid on guilds with the `allowAll` permission set to false, and with a role for `basic` or `advanced` access configured.")}
      const roleChecks = guildConfig.perms.basic.concat(guildConfig.perms.advanced).concat(['776927641789661204','776927643319795763']);
      var channel = message.channel;
      if (args.length > 0) {
        const matchC = args[0].match(/\d{10,}/)[0];
        if (matchC) {
          const tempC = message.guild.channels.cache.get(matchC);
          if (tempC && tempC.type == "text") {channel = tempC}
          else {
            tempC2 = await message.guild.channels.resolve(matchC);
            if (tempC2 && tempC2.type == "text") {channel = tempC2}
          }
        }
      }
      const toDuration = require('./../../misc_functions/toDuration.js');
      const dayMS = 86400000;
      const now = (new Date()).getTime();
      const members = await message.guild.members.fetch();
      const filteredMembers = members.filter(m => (now - m.joinedAt.getTime() > dayMS) && roleChecks.filter(r=>m.roles.cache.has(r.id)).length == 0).map(m => `<@${m.user.id}>: You've been flagged for inactivity. You joined about ${toDuration(now - m.joinedAt.getTime(), 2)} ago and have yet to post at <#72807025107756646>.`).join('\n');
      const msgText = filteredMembers+'\n\n---\n\nPlease read <#728070078008000592> if you need help gaining access, and post your writing sample at <#728070251077566464>. If you need further assistance, ask at <#728072324372365362> and a member or staffer will assist you. Over the next 72 hours this inactivity purging process will become more automated, whereby unapproved users inactive for over 3-4 days will be automatically kicked. If you\'re currently too busy to write what\'s required, save our disboard link from <#728361945299681332> and leave before you\'re purged so that you can come back later.';
      await channel.send(msgText,{split: true});
    },
};
