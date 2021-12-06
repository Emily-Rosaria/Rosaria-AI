const Discord = require('discord.js'); // Embed
const {Client} = require('exaroton');
require('dotenv').config(); //for .env file

module.exports = {
    name: 'status', // The name of the command
    description: 'Shows you the server status and IP!', // The description of the command (for help text)
    aliases: ['address','ip'],
    allowDM: true,
    perms: "basic",
    cooldown: 10,
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {

      const mcClient = new Client(process.env.MCTOKEN);
      let account = await mcClient.getAccount();
      let server = [...await mcClient.getServers()].find(s=>serverName.toLowerCase()==s.name.toLowerCase());
      const statJSON = {
        "0": ["🔴","Offline","#FF0000","Offline"],
        "1": ["🟢","Online","#37d53f","Online"],
        "2": ["🟠","Starting","#fa7f26","Starting"],
        "3": ["🔴","Stopping","#FF0000","Offline"],
        "4": ["🟠","Restarting","#fa7f26","Starting"],
        "5": ["🔵","Saving","#2370dd","Offline"],
        "6": ["🟠","Loading","#fa7f26","Starting"],
        "7": ["🔴","Crashed","#FF0000","Crashed"],
        "8": ["🟠","Pending","#fa7f26","Pending"],
        "9": ["","???","#000000","Pending"],
        "10": ["🟠","Preparing","#fa7f26","Starting"]
      };
      await message.reply(`${server.name}`)
      const title = server.name;
      const status = statJSON[""+server.status];
      const embed = new Discord.MessageEmbed()
      .setTitle(title + " - Server Address")
      .setFooter(footer)
      .setDescription(`You should be able to join this server at ${server.address}!`)
      .setColor(status[2])
      .addField("Status",`${status[0]} ${status[1]}`,true)
      .addField("Players",`${server.players.count}/${server.players.max}`,true)
      .addField("Software",`${server.software.name} ${server.software.version}`,true)
      .setTimestamp();
      if (server.port && server.host) {
        embed.addField("Trouble Joining",`Try using the following dynamic IP instead: \`${server.host}:${server.port}\``,false);
      }
      if (server.players.count > 0) {
        const playerList = server.players.list.join(', ');
        embed.addField("Currently Online",playerList,false);
      }
      await message.channel.send({embed: embed});
    },
};
