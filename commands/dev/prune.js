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
    const lurkers = guildConfig.lurkers; // gets lurkers
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
      m = await guild.member(L._id);
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
    const lastFetch = await guild.members.fetch({ user: unFound, force: true}).then((members)=>members.map(m=>{
      console.log([m.user.id,m.user.username,m.deleted]);
      if (m && !m.deleted) {
        let temp = {};
        temp._id = m.id;
        temp.joinedAt = m.joinedAt.getTime();
        temp.warnings = 0;
        temp.lastPing = m.joinedAt.getTime();
        return [m,temp];
      } else if (m && m.deleted) {
        left.push(m.id);
        return false;
      } else {
        return false;
      }
    }).filter(m => m != false)).catch((err)=>{console.error(err); return [];});
    unFound = unFound.filter(u=>!(lastFetch && lastFetch.find(f=>f._id == u)));
    fetched = !!lastFetch && lastFetch.length > 0 ? fetched.concat(lastFetch) : fetched;
    unFound = unFound.filter(u=>u.lastPing+dayMS<now); // remove recent pings
    if (unFound.length > 0) {
      message.reply("Could not fetch data for the users listed below. If they've left the discord, you can remove them from the lurker list via the `r!unlurk <userIDs>` command. If not, then here is their lurker data:\n>>> "+unFound.map(u => {
        const joinedAt = toDuration(now - u.joinedAt, 2);
        const lastPing = u.joinedAt != u.lastPing ? ` and they were last notified \`${toDuration(now - u.lastPing, 2)}\` ago` : '';
        let warnText = (u.warnings + 1).toString();
        if (warnText.endsWith("1")) {
          warnText = warnText+"st";
        } else if (warnText.endsWith("2")) {
          warnText = warnText+"nd";
        } else if (warnText.endsWith("3")) {
          warnText = warnText+"rd";
        } else {
          warnText = warnText+"th";
        }
        return `<@${u._id}> joined \`${joinedAt}\` ago${lastPing}. This would be their \`${warnText}\` activity ping.`;
      }).join('\n'),{split: true});
    }
    let noLurk = []; // member objects of users who are no longer lurkers
    const finalLurkers = fetched.filter(m => {
      if (m[0].deleted) {
        left.push(m[1]._id);
        return false;
      }
      if (roleChecks.filter(r=>m[0].roles.cache.has(r.id)).length == 0) {
        if (m[1].lastPing+dayMS<now) {
          return true;
        } else {
          return false;
        }
      } else {
        noLurk.push(m);
        return false;
      }
    });

    const lurkerText = finalLurkers.map(m => {
      let warnText = (m[1].warnings + 1).toString();
      if (warnText.endsWith("1")) {
        warnText = warnText+"st";
      } else if (warnText.endsWith("2")) {
        warnText = warnText+"nd";
      } else if (warnText.endsWith("3")) {
        warnText = warnText+"rd";
      } else {
        warnText = warnText+"th";
      }
      const lastPing = m[1].joinedAt != m[1].lastPing ? `, and your were last notified \`${toDuration(now - m[1].lastPing, 2)}\` ago.` : '';
      return `<@${m[1]._id}>: You've been flagged for inactivity. You joined about \`${toDuration(now - m[1].joinedAt, 2)}\` ago and have yet to post at <#728070251077566464>. This is your \`${warnText}\` recorded activity ping${lastPing}.`
    }).join('\n');
    const warningText = guildConfig.perms.purge > 0 ? `You typically have about \`${guildConfig.perms.purge}\` reminders before being kicked. `: '';
    const msgText = lurkerText+'\n\n---\n\nPlease read <#728070078008000592> if you need help gaining access, and post your writing sample at <#728070251077566464>. If you need further assistance, ask at <#728072324372365362> and a member or staffer will assist you. '+warningText+'If you\'re currently too busy to write what\'s required, save our disboard link from <#728361945299681332> and leave before you\'re purged so that you can come back later.';
    await channel.send(msgText,{split: true});
    if (left.length > 0) {
      await message.author.send("Here are the IDs of users who left the server: `"+left.map(id => `<@${id}>`).join(' ')+"`.");
    }
    if (noLurk.filter(m => m[1].warnings > 0).length > 0) {
      await message.author.send("Here are the IDs of previously warned users who are no longer lurkers: `"+noLurk.map(m => `<@${m[0].user.id}>`).join(' ')+"`.");
    }

    const remove = left.concat(noLurk.map(m=>m[1]._id));
    await GuildData.findByIdAndUpdate({_id: guild.id},{"$pull": {"lurkers": {"_id": {"$in": remove}}}}).exec();

    const pinged = unFound.map(u=>u._id).concat(finalLurkers.map(m => m[1]._id));
    const update = {"$inc" : {"lurkers.$.warnings" : 1}, "$set" : {"lurkers.$.lastPing" : (new Date()).getTime()}};
    const newData = await GuildData.updateMany({_id: guild.id, "lurkers._id" : {"$in" : pinged}},update,{new: true}).exec();
  },
};
