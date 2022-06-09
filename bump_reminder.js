const Discord = require('discord.js'); // Loads the discord API library

const guildID = '727569853405200474';
const channelID = '728288393217179648';
const roleID = '984276450297413682';

module.exports = async function (client) {
  const now = new Date();
  const oneHour = 1000*60*60;

  var lastBumps = client.bumpPings;
  var latest = Math.max(...[...lastBumps.values()]);
  if (now.getTime() - latest < 2*oneHour) {
    return; // recent bump
  }

  var guild = await client.guilds.resolve(guildID);
  var channel = await guild.channels.resolve(channelID);

  var ping = [];
  lastBumps.forEach(async (timestamp, uID) => {
    // keep
    if (uID == "0") {
      return;
    }
    if (now.getTime() - timestamp < 5*oneHour) {
      const member = guild.members.resolve(uID);
      if (guild.members.resolve(uID)) {
        if([...member.roles.cache.keys()].includes(roleID)) {
          ping.push(uID);
        }
      }
    // drop
    } else {
      client.bumpPings.delete(uID);
    }
  });
  // make next reminder be in 1 hour unless someone bumps sooner
  client.bumpPings.set("0",now.getTime() - oneHour);
  const pingText = ping.length > 0 ? "<@" + ping.join(">, <@") + ">" : "";
  channel.send({
    content:`${pingText}\nRemember to bump the server with the \`/bump\` command. If you'd like to be pinged and reminded to do this, opt-in to the <@&${roleID}> role over at <#728277621598584973>.`,
    allowedMentions: {
      parse:["users"]
    }
  });
};
