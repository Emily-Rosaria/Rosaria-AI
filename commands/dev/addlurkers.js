const GuildData = require('./../../database/models/guilds.js');

module.exports = {
  name: 'addlurkers', // The name of the command
  aliases: ['lurkeradd'],
  description: 'Add members without a role to the lurker list!', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  args: 1,
  usage: '<lurkerIDs>', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    var client = message.client;
    const guild = message.guild;
    const guildConfig = await GuildData.findById(message.guild.id).exec();
    if (!guildConfig || !guildConfig.perms || typeof guildConfig.perms.purge == "undefined" || guildConfig.perms.purge < 0) {message.reply("This command is only valid on guilds with the `purge` setting configured."); return;}
    const roleChecks = guildConfig.perms.basic.concat(guildConfig.perms.advanced).concat(guildConfig.perms.spectator);
    const toDuration = require('./../../misc_functions/toDuration.js');
    let unFound = []; // IDs of users we couldn't fetch
    let fetched = []; // Lurker objects of users we could find
    let noLurk = []; // IDs of users who aren't lurkers
    let left = []; // IDs of users who left the discord
    const cache = guild.members.cache; // bot's cache
    let parsed = [];
    fetched = args.filter(arg=>arg.match(/\d{10,}/)).map(arg=>{
      const id = arg.match(/\d{10,}/)[0];
      parsed.push(id);
      if (guild.members.cache.has(id)) {
        const m = guild.members.cache.get(id);
        if (roleChecks.filter(r=>m.roles.cache.has(r.id)).length > 0) {
          noLurk.push(id);
          return {_id: "0"};
        } else if (m.deleted) {
          left.push(id);
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
    //message.reply("Cache checked... now fetching member data...");
    //message.reply("Parsed: `"+parsed.join(' ')+"`");
    unFound = unFound.filter(async (id) => {
      m = await guild.member(id) //.then((g)=>g).catch((err)=>{console.error(err); return false;});
      if (m && !m.deleted) {
        if (roleChecks.filter(r=>m.roles.cache.has(r.id)).length == 0) {
          let temp = {};
          temp._id = m.id;
          temp.joinedAt = m.joinedAt.getTime();
          temp.warnings = 0;
          temp.lastPing = m.joinedAt.getTime();
          noLurk.push(temp);
          return false;
        } else {
          fetched.push(temp);
          return false;
        }
      } else if (m && m.deleted) {
        left.push(id);
        return false;
      } else {
        return true;
      }
    });
    const lastFetch = await guild.members.fetch({ user: unFound, force: true}).then((members)=>members.map(m=>{
      if (m && !m.deleted) {
        let temp = {};
        temp._id = m.id;
        temp.joinedAt = m.joinedAt.getTime();
        temp.warnings = 0;
        temp.lastPing = m.joinedAt.getTime();
        return temp;
      } else {
        left.push(m.id);
        return false;
      }
    })).catch((err)=>{console.error(err); return [];});
    unFound = unFound.filter(u=>!(lastFetch && lastFetch.find(f=>f._id == u)));
    fetched = !!lastFetch ? fetched.concat(lastFetch) : fetched;
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
    newGuildConfig = await GuildData.findByIdAndUpdate(guild.id, {"$push": {lurkers: fetched}},{new: true})
  },
};
