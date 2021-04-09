const Discord = require('discord.js'); // Loads the discord API library

// function reminds users between 24 and 48 hours after they joined
// function reminds users again between 3 and 4 days after they joined
// function kicks users once they've been on the server for 5+ days

const guildID = ['727569853405200474'];
const verified_roles = ['727570445360169000','776927641789661204'];

module.exports = async function (client) {
    var guild = await client.guilds.fetch(guildID);
    guild.members.fetch().then(async (member)=>{
      if (!member.roles || !member.roles.highest || ![...member.roles.keys()].some(rID=>{verified_roles.includes(""+rID)})) {
        console.log(member.user.username + " - " + member.user.id);
      }
    }).catch((err)=>console.error(err));
};
