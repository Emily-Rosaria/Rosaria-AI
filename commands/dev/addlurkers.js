const GuildData = require('./../../database/models/guilds.js');

module.exports = {
  name: 'addlurkers', // The name of the command
  aliases: ['lurkeradd'],
  description: 'Add members without a role to the lurker list!', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  usage: '<lurkerIDs>', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    var client = message.client;
    const guild = message.guild;
    const guildConfig = await GuildData.findById(message.guild.id).exec();
    if (!guildConfig || !guildConfig.perms || typeof guildConfig.perms.purge == "undefined" || guildConfig.perms.purge < 0) {return message.reply("This command is only valid on guilds with the `purge` setting configured.")}
    const roleChecks = guildConfig.perms.basic.concat(guildConfig.perms.advanced).concat(guildConfig.perms.spectator);
    const toDuration = require('./../../misc_functions/toDuration.js');
    let unFound = []; // IDs of users we couldn't fetch
    let fetched = []; // Lurker objects of users we could find
    let noLurk = []; // IDs of users who aren't lurkers
    const cache = guild.members.cache; // bot's cache
    fetched = args.filter(arg=>arg.match(/d{10,}/)).map(arg=>{
      const id = arg.match(/d{10,}/)[0];
      if (guild.members.cache.has(id)) {
        const m = guild.members.cache.get(id);
        if (roleChecks.filter(r=>m.roles.cache.has(r.id)).length == 0) {
          noLurk.push(id);
          return {_id: "0"};
        } else if (m.deleted) {
          unFound.push(id);
          return {_id: "0"};
        }
        let temp = {};
        temp._id = m.id;
        temp.joinedAt = m.joinedAt.getTime();
        temp.warnings = 0;
        temp.lastPing = m.joinedAt.getTime();
        return temp;
      } else {
        unFound.push(id);
        return {_id: "0"};
      }
    }).filter(m=>m._id != "0");

    unFound = unFound.filter(async (id) => {
      m = await guild.member(id).catch((err)=>{console.error(err); return false;});
      if (m && !m.deleted) {
        let temp = {};
        temp._id = m.id;
        temp.joinedAt = m.joinedAt.getTime();
        temp.warnings = 0;
        temp.lastPing = m.joinedAt.getTime();
        fetched.push(temp);
        return false;
      } else {
        return true;
      }
    });
    if (unFound.length > 0) {
      message.reply("Could not fetch member data for the users pinged below.\n>>> "+unFound.map(id => `<@${id}>`).join('\n'));
    }
    if (left.length > 0) {
      message.reply("Could not add the following users as lurkers as they've left the discord.\n>>> "+left.map(id => `<@${id}>`).join('\n'));
    }
    if (noLurk.length > 0) {
      message.reply("Could not add the following users as lurkers as they have been assigned a role. To remove a lurker, use `r!unlurk`.\n>>> "+noLurk.map(id => `<@${id}>`).join('\n'));
    }
    let dupe = [];
    let added = [];
    const newConfig = await fetched.reduce(async (acc, lurk) => {
      let newGuildConfig = {};
      if (acc.lurkers && acc.lurkers.length > 0) {
        const oldLurker = acc.lurkers.find(L=>L._id == lurk._id);
        if (oldLurker) {
          dupe.push(lurk._id);
          newGuildConfig = acc;
        } else {
          added.push(lurk._id);
          newGuildConfig = await GuildData.findByIdAndUpdate(acc._id,{ "$push": { lurkers: lurk}},{new: true}).exec();
        }
      } else if (acc.lurkers && acc.lurkers.length == 0) {
        added.push(lurk._id);
        newGuildConfig = await GuildData.findByIdAndUpdate(acc._id,{ "$push": { lurkers: lurk}},{new: true}).exec();
      } else {
        added.push(lurk._id);
        newGuildConfig = await GuildData.findByIdAndUpdate(acc._id,{ "$set": {lurkers: [lurk]}},{new: true}).exec();
      }
      return newGuildConfig;
    },guildConfig);
    if (dupe.length > 0) {
      message.reply("The following users were already registered as lurkers:\n>>> "+dupe.map(id => `<@${id}>`).join('\n'));
    }
    if (added.length > 0) {
      message.reply("The following users were added as lurkers:\n>>> "+added.map(id => `<@${id}>`).join('\n'));
    } else {
      message.reply("No valid users were found to be added as lurkers.");
    }
  },
};
