const Discord = require('discord.js'); // Embed
const {Client} = require('exaroton');
require('dotenv').config(); //for .env file
const config = require('./../../config.json'); // load bot config

module.exports = {
    name: 'start', // The name of the command
    description: 'Starts the minecraft server.', // The description of the command (for help text)
    allowDM: false,
    perms: "basic",
    args: false,
    cooldown: 30,
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
      if (server.status == 0 || server.status == 7) {
        try {
          await server.start();
          return message.reply(`Attempting to start \`${server.address}\`... See <#848274767034449990> for updates.`)
        } catch(e) {
          return message.reply("An error occured trying to start the server.\n```\n"+e.stack+"\n```");
        }
      } else {
        return message.reply(`Could not start \`${server.address}\` as it is currently ${status[0]}${status[1]}.`);
      }
    },
};
