const Discord = require('discord.js'); // Embed
const {Client} = require('exaroton');
require('dotenv').config(); //for .env file
const config = require('./../../config.json'); // load bot config

module.exports = {
    name: 'whitelist', // The name of the command
    aliases: ['mc','minecraft'],
    description: 'Adds your minecraft account to the server whitelist! Put a period (.) before any bedrock usernames to distinguish them from Java ones.', // The description of the command (for help text)
    perms: 'basic',
    allowDM: false,
    cooldown: 10,
    usage: '[username]', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {
      const serverName = config.minecraft.server;
      const mcClient = new Client(process.env.MCTOKEN);
      let account = await mcClient.getAccount();
      let server = [...await mcClient.getServers()].find(s=>serverName.toLowerCase()==s.name.toLowerCase());

      if (!args || args.length == 0) {
        try {
          let list = server.getPlayerList("whitelist");
          const whitelist = await list.getEntries();
          await message.reply("The server whitelist should be:\n>>> "+whitelist.join('\n'));
        } catch (e) {
          const errorMsg = e.stack.toString().length > 1900 ? e.stack.toString().slice(0,1900) + "..." : e.stack.toString();
          await message.reply("Error running command:\n```\n"+errorMsg+"\n```");
        }
        return;
      }

      try {
        const name = args.join('_').trim();
        let list = server.getPlayerList("whitelist");
        await list.addEntry(name); // add just one entry
        const whitelist = await list.getEntries();
        if (name.startsWith('.')) {
          await message.reply("Done! The bedrock account `" + name + "` was successfully added to the server's whitelist.");
        } else {
          await message.reply("Done! The java account `" + name + "` was successfully added to the server's whitelist.");
        }
      } catch (e) {
          console.error(e);
          await message.reply("An error occured.");
      }
    },
};
