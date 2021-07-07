const Discord = require('discord.js'); // Loads the discord API library

// function reminds users between 24 and 48 hours after they joined
// function reminds users again between 3 and 4 days after they joined
// function kicks users once they've been on the server for 5+ days

const guildID = ['727569853405200474'];
const verified_roles = ['727570445360169000','776927641789661204','776927643319795763'];
const rejected_role = '830226022174949386'; // role for people who submitted something and/or were rejected
const lurk_channel = '775926318033928222';
const oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds

module.exports = async function (client) {
    var guild = await client.guilds.fetch(guildID);
    var channel = await guild.channels.resolve(lurk_channel);
    const now = new Date();

    // delete old reminders
    channel.messages.fetch().then(async (messages)=>{
      var deleteMessages = messages.filter((message)=>{
        if (message.pinned || message.createdAt.getTime() + 14*oneDay < now.getTime()) {
          return false; // don't delete old or pinned messages
        }
        if (message.createdAt.getTime() + 10*oneDay < now.getTime() || (message.author.bot && message.createdAt.getTime() + 3*oneDay > now.getTime()) || (message.author.id == client.user.id && message.createdAt.getTime() + 0.5*oneDay > now.getTime())) {
          return true;
        } else {
          return false;
        }
      });
      await channel.bulkDelete(deleteMessages);
    }).catch((err)=>console.error(err));

    guild.members.fetch().then((members)=>{
      var lurkers = members.filter((member)=>{
        if (!member.user.bot && (!member.roles || !member.roles.hoist || ![...member.roles.cache.keys()].some(rID=>verified_roles.concat(rejected_role).includes(""+rID)))) {
          return true;
        }
        return false;
      });
      var lurkersNew = [];
      var lurkersOld = [];
      lurkers.each((lurker)=>{
        if (lurker.joinedAt.getTime() + oneDay*2 > now.getTime()) {
          return; // joined less than 48 hours ago
        }
        if (lurker.joinedAt.getTime() + oneDay*6.2 < now.getTime()) {
          if (!lurker.roles.cache.has(rejected_role)) {
            lurker.kick("Inactivity. Joined over 6 days ago."); // kick lurker if no recent submission attempt was made
          }
          return; // don't remind people who made a submission that prevented them from being kicked
        }
        if (lurker.joinedAt.getTime() + oneDay*4.1 > now.getTime()) {
          lurkersNew.push(lurker.user.id); // newer lurkers who joined less than 4 days ago
          return;
        } else {
          lurkersOld.push(lurker.user.id); // lurkers who will be kicked soon
        }
      });
      lurkersNew = !lurkersNew || lurkersNew.length == 0 ? "" : "**Newer Members** - If you're pinged here, you have a good few days to get approved.\n" + lurkersNew.map(l=>`> <@${l}>`).join('\n') + "\n";
      lurkersOld = !lurkersOld || lurkersOld.length == 0 ? "" : "**Older Members** - If you're pinged here, you have only one or two days to get approved.\n" + lurkersOld.map(l=>`> <@${l}>`).join('\n') + "\n";
      if (lurkersNew || lurkersOld) {
        var reminder = `__Lurker Reminder__\n\nRemember to post at <#728070251077566464> to get full server access. If you need help, be sure to first read <#728070078008000592> and then ask your questions at <#728072324372365362>. To prevent an inflated or inaccurate member count, you'll be automatically kicked about 6 or so days after you've joined if you haven't recently made a reasonable attempt to gain access.\n\n${lurkersNew}${lurkersOld}\n\n`;
        channel.send(reminder);
      }
    }).catch((err)=>console.error(err));
};
