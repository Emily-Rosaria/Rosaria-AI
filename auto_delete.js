const Discord = require('discord.js'); // Loads the discord API library
const mongoose = require("mongoose"); //database library
const Prune = require("./../database/models/prune.js"); // users model

const guildID = '727569853405200474';
//const channelID = '728297467292024973';

module.exports = async function (client) {

  var guild = client.guilds.resolve(guildID);
  const now = new Date();
  const oneDay = 1000*60*60*24;
  //var channel = await guild.channels.resolve(channelID);
  const query = {timestamp: {$lte: now.getTime() - 12*oneDay}};
  const sort = {channel: 1, _id: 1};
  const channelMessageMap = {};
  const data = await Prune.find(query).limit(20).sort(sort).exec();

  data.forEach((item) => {
    if (!Object.keys(channelMessageMap).includes(item.channel)) {
      channelMessageMap[item.channel] = []
    }
    channelMessageMap[item.channel].push(item._id)
  });

  Object.keys(channelMessageMap).forEach(async (channelID) => {
    var channel = client.guilds.resolve(channelMessageMap[channelID]);
    for (m of channelMessageMap[channelID]) {
      await channel.fetch(m).then(async (message) => {
        if (!message.pinned) {
          await message.delete();
        }
        await Prune.deleteOne({_id:message.id}).exec();
      })
    }
  });



  channel.messages.fetch().then(async (messages)=>{
    var deleteMessages = messages.filter((message)=>{
      if (message.pinned || message.createdAt.getTime() + 14*oneDay < now.getTime()) {
        return false; // don't delete new or pinned messages
      }
      if (message.createdAt.getTime() + 14*oneDay < now.getTime() || (message.author.bot && message.createdAt.getTime() + 3*oneDay > now.getTime()) || (message.author.id == client.user.id && message.createdAt.getTime() + 0.5*oneDay > now.getTime())) {
        return true;
      } else {
        return false;
      }
    });
    await channel.bulkDelete(deleteMessages);
  }).catch((err)=>console.error(err));

  const now = new Date();
  const oneHour = 1000*60*60;
}
