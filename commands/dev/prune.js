const GuildData = require('./../../database/models/guilds.js');

module.exports = {
  name: 'prune', // The name of the command
  aliases: ['purge'],
  description: 'Warns members without a role on a server to get verified or get kicked!', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  usage: '<channel-to-post-in>', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {

    var client = message.client;
    const guild = message.guild;
    const guildConfig = await GuildData.findById(message.guild.id).exec();
    if (!guildConfig || !guildConfig.perms || typeof guildConfig.perms.purge == "undefined" || guildConfig.perms.purge < 0) {return message.reply("This command is only valid on guilds with the `purge` setting configured.")}
    const roleChecks = guildConfig.perms.basic.concat(guildConfig.perms.advanced).concat(guildConfig.perms.spectator);
    let channel = message.channel;
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
    const dayMS = 82800000; // actually 23 hours (in milliseconds) to allow for leeway
    const now = (new Date()).getTime();
    let unFound = []; // "Lurker" objects of users we couldn't fetch
    let left = []; // IDs of users who left
    let fetched = []; // member objects of users we could find paired with their lurker objects [m, L] basically.
    const cache = guild.members.cache; // bot's cache
    const lurkers = guildConfig.lurkers.filter(L=>L.lastPing+dayMS<now); // gets lurkers with no recent ping
    lurkers.forEach(L=>{
      if (!cache.has(L._id)) {unFound.push(L)}
      else {
        m = cache.get(L._id);
        if (m.deleted) {
          left.push(L._id);
        } else {
          fetched.push([m, L]);
        }
      }
    });
    unFound = unFound.filter(async (L) => {
      m = await guild.member(L._id).catch((err)=>{console.error(err); return false;});
      if (m && !m.deleted) {
        fetched.push([m, L]);
        return false;
      } else if (m && m.deleted) {
        left.push(L._id);
        return false;
      } else {
        return true;
      }
    });
    if (unFound.length > 0) {
      message.reply("Could not fetch data for the users listed below. If they've left the discord, you can remove them from the lurker list via the `r!unlurk <userIDs>` command. If not, then here is their lurker data:\n>>> "+unFound.map(u => {
        const joinedAt = toDuration(now - u.joinedAt, 2);
        const lastPing = u.joinedAt != u.lastPing ? ` and they were last notified \`${toDuration(now - u.lastPing, 2)}\` ago` : '';
        let warnings = (u.warnings + 1).toString();
        switch (warnings) {
          case warnings.endsWith("1"):
            warnings = warnings+"st";
            break;
          case warnings.endsWith("2"):
            warnings = warnings+"nd";
            break;
          case warnings.endsWith("3"):
            warnings = warnings+"rd";
            break;
          default:
            warnings = warnings+"th";
        }
        return `<@${u._id}> joined \`${joinedAt}\` ago${lastPing}. This would be their \`${warnings}\` activity ping.`;
      }).join('\n'),{split: true});
    }
    let noLurk = []; // member objects of users who are no longer lurkers
    const finalLurkers = fetched.filter(m => {
      if (roleChecks.filter(r=>m[0].roles.cache.has(r.id)).length == 0) {
        return true;
      } else {
        noLurk.push(m[0]);
        return false;
      }
    });

    const lurkerText = finalLurkers.map(m => {
      let warnText = (m[1].warnings + 1).toString();
      switch (warnText) {
        case warnText.endsWith("1"):
          warnText = warnText+"st";
          break;
        case warnText.endsWith("2"):
          warnText = warnText+"nd";
          break;
        case warnings.endsWith("3"):
          warnText = warnText+"rd";
          break;
        default:
          warnText = warnText+"th";
      }
      const lastPing = m[1].joinedAt != m[1].lastPing ? `, and your were last notified \`${toDuration(now - m[1].lastPing, 2)}\` ago.` : '';
      return `<@${m.user.id}>: You've been flagged for inactivity. You joined about \`${toDuration(now - m[1].joinedAt, 2)}\` ago and have yet to post at <#72807025107756646>. This is your \`${warnText}\` recorded activity ping${lastPing}.`
    }).join('\n');
    const warningText = guildConfig.perms.purge > 0 ? `You typically have about \`${guildConfig.perms.purge}\` reminders before being kicked. `: '';
    const msgText = memberText+'\n\n---\n\nPlease read <#728070078008000592> if you need help gaining access, and post your writing sample at <#728070251077566464>. If you need further assistance, ask at <#728072324372365362> and a member or staffer will assist you. '+warningText+'If you\'re currently too busy to write what\'s required, save our disboard link from <#728361945299681332> and leave before you\'re purged so that you can come back later.';
    await channel.send(msgText,{split: true});
    await message.author.send("Here are the IDs of users who left the server: `"+left.map(m.user.id).join(' ')+"`.");
    await message.author.send("Here are the IDs of users who are no longer lurkers: `"+noLurk.join(' ')+"`.");
  },
};
