const config = require('./../config.json'); // load bot config
const Discord = require('discord.js'); // Loads the discord API library

module.exports = {
  name: "onMessage",
  async event(message) {

    const dev = config.perms.dev[0];

    // end if there's no content
    if (!message.content) {
      return;
    }

    const client = message.client;

    // get cached roles of a user
    const roleCache = message.channel.type != "dm" && message.member && message.member.roles && message.member.roles.cache ? [...message.member.roles.cache.keys()] || [] : [];

    const botPing = ["<@" + client.user.id + ">","<@!" + client.user.id + ">"];

    const dmExtraPrefix = (message.channel.type == "dm") ? ["!","?","+","-"] : ["r!"];
    // Find if message begins with a valid command prefix

    const prefix_arr = (message.guild && message.guild.id == "749880737712308274") ? ["r!","r?"] : config.prefix;

    const prefix = prefix_arr.concat(botPing).concat(dmExtraPrefix).filter(p => message.content.toLowerCase().startsWith(p));

    // If command wasn't used
    if (!prefix || prefix.length < 1) {
      return;
    }

    // Split commands and arguments from message so they can be passed to functions
    const args = message.content.slice(prefix[0].length).trim().split(/ +/);

    // the dashes and underscores are optional in command names, as is capitalisation
    const commandName = args.shift().toLowerCase().replace(/[-_]+/,'');

    // check if the message is a valid command
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // return if command isn't valid
    if (!command) {
      return;
    }

    if (command.args && (!args.length || command.args > args.length)) {
      let reply = 'That command requires more details!';

      // If we have details on how to use the args, provide them
      if (command.usage) {
          reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
      }

      // Send a reply from the bot about any error encountered
      return message.channel.send(reply);
    }

    // manage cooldowns
    const cooldowns = message.client.cooldowns;

    if(!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3 ) * 1000;

    if(!timestamps.has(message.author.id)) {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    } else {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if(now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        const msg = await message.reply(`Whoa! You're sending commands too fast! Please wait ${timeLeft.toFixed(1)} more second(s) before running \`${command.name}\` again!`);
        if (message.channel.type != "dm") {
          return msg.delete({ timeout: 5000 });
        }
      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    // manage perm denials
    if(command.perms) {

      //manage dev commands
      if (command.perms == "dev" && !config.perms.dev.includes(message.author.id)) {
        return;
      }

      if (message.channel.type == "dm") {
        // manage dm commands
        if (!command.allowDM) {
          return message.reply("This command is not available for use in DMs.");
        }
      } else {
        // check perms for admin/mod commands where user isn't a dev
        if (!config.perms.dev.includes(message.author.id)) {
          if (command.perms == "basic" && message.guild.id == config.guild && !config.perms.basic.concat(config.perms.trusted).some(rID => roleCache.includes(rID))) {
            return message.reply("You need to be an approved user to use this command!");
          }
          if (command.perms == "trusted" && message.guild.id == config.guild && !config.perms.trusted.some(rID => roleCache.includes(rID))) {
            return message.reply("You're not cool enough to use this command!");
          }
          if (command.perms == "mod" && !config.perms.mod.some(rID => roleCache.includes(rID))) {
            return message.reply("You need to be a moderator to use this command!");
          }
          if (command.perms == "admin" && !config.perms.admin.some(rID => roleCache.includes(rID))) {
            return message.reply("You need to be an admin to use this command!");
          }
        }
      }
    }

    if (command.rose && message.guild && message.guild.id != config.guild) {
      return;
    }

    // Try to run the command!
    try {
      await command.execute(message, args);
    } catch(error) {
      console.error(error);
      message.reply('Sorry! I ran into an error trying to do that!').then(m=>{
        m.delete({timeout:60*1000});
      });
      const devUser = client.users.cache.get(dev);
      const msg = (message.content.length > 200) ? message.content.slice(0,200) + ' [...]' : message.content;
      const errmsg = (error.stack.toString().length > 1500) ? error.stack.toString().slice(0,1500) + '...' : error.stack;
      const errLocation = message.channel.type == "dm" ? 'in `Direct Messages`' : 'from `'+message.channel.name+'`';
      devUser.send('Error running command: `'+msg+'`\nSender: `'+message.author.username+'#'+message.author.discriminator+'` '+errLocation+'\nError Report:\n```'+errmsg+'```');
    }
  },
};
