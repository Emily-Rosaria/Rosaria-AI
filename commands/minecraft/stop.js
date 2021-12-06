const Discord = require('discord.js'); // Embed
const {Client} = require('exaroton');
require('dotenv').config(); //for .env file
const config = require('./../../config.json'); // load bot config

module.exports = {
    name: 'stop', // The name of the command
    description: 'Stops the minecraft server.', // The description of the command (for help text)
    allowDM: false,
    perms: "dev",
    args: false,
    cooldown: 10,
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {
      const serverName = config.minecraft.server;
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

      const status = statJSON[""+server.status];
      if (server.status == 1) {
        if (server.players.count != 0) {
          return message.reply(`There are currently ${server.players.count}/${server.players.max} players online, so you don't have the permissions to manually stop the server early. If you're an admin, you can stop the server via the online dashboard.`)
        } else {
          try {
            await server.stop();
            return message.reply(`Attempting to stop \`${server.address}\`...`)
          } catch(e) {
            return message.reply("An error occured trying to stop the server.\n```\n"+e.stack+"\n```");
          }
        }
      } else {
        return message.reply(`Could not stop \`${server.address}\` as it is currently ${status[0]}${status[1]}.`);
      }
    },
};
