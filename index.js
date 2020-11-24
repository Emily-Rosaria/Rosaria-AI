const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

// Bot stuff below

const Reddit = require('reddit'); // Reddit
const fetch = require('node-fetch'); // This lets me get stuff from api.
const Booru = require('booru'); // This lets me get stuff from weeb sites.
const fs = require('fs');                               // Loads the Filesystem library
const path = require("path");
const Discord = require('discord.js');                  // Loads the discord API library
const Canvas = require('canvas'); // Pretty pictures
const readline = require('readline');
const {google} = require('googleapis');
const { prefix, perms } = require('./config.json');
const data = require("@replit/database");
const db = new data();

const client = new Discord.Client(); // Initiates the client

client.commands = new Discord.Collection(); // Creates an empty list in the client object to store all commands
const getAllCommands = function (dir, cmds) {
  files = fs.readdirSync(dir, { withFileTypes: true });
  fileArray = cmds || [];
  files.forEach((file) => {
    if (file.isDirectory()) {
      const newCmds = fs.readdirSync(dir + '/' + file.name);
      fileArray = fileArray.concat(newCmds.map((f) => dir + '/' + file.name + '/' + f));
    } else if (file.name.endsWith('.js')) {
      fileArray = fileArray.concat([dir + '/' + file.name]);
    }
  });
  return fileArray;
};
const commandFiles = getAllCommands('./commands').filter(file => file.endsWith('.js')); // Loads the code for each command from the "commands" folder

// Loops over each file in the command folder and sets the commands to respond to their name
for (const file of commandFiles) {
    const command = require(file);
    client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection(); // Creates an empty list for storing timeouts so people can't spam with commands

// Starts the bot and makes it begin listening for commands.
client.on('ready', async function() {
    client.user.setPresence({ activity: { type: 'PLAYING', name: 'with my adorable subjects' }, status: 'online' });
    client.intervals = new Discord.Collection(); // Creates list for running intervals
    const intervalFiles = fs.readdirSync('./intervals').filter(file => file.endsWith('.js')); // collects the intervals
    for (const file of intervalFiles) {
        const interval = require(`./intervals/${file}`); //cycles through and initialises the intervals
        for (const c of interval.channels) {
            console.log('Setting up '+interval.name+c+'.');
            const ic = client.channels.cache.get(c);
            if (interval.delayChaos) {
              if (interval.database) {
                let loop = (interval,ic,db) => {
                  interval.execute(ic,db);
                  const nextDelay = (interval.delay*1000) + Math.ceil(Math.random()*interval.delayChaos*1000);
                  const timeout = client.setTimeout(loop,nextDelay,interval,ic,db);
                  client.intervals.set(interval.name+c,timeout);
                };
                loop(interval,ic,db);
              } else {
                let loop = (interval,ic) => {
                  interval.execute(ic);
                  const timeout = client.setTimeout(loop,(interval.delay*1000) + Math.ceil(Math.random()*interval.delayChaos*1000),interval,ic,db);
                  client.intervals.set(interval.name+c,timeout);
                };
                loop(interval,ic);
              }
            } else {
              if (interval.database) {
                const timeout = client.setInterval(() => {
                  interval.execute(ic,db);
                },db,ic,interval);
                client.intervals.set(interval.name+c,timeout)
              } else {
                const timeout = client.setInterval(() => {
                  interval.execute(ic);
                },ic,interval);
                client.intervals.set(interval.name+c,timeout)
              }
            }
        }
    }
    console.log(`${client.user.username} is up and running!`);
});

/**
 * This function controls how the bot reacts to messages it receives
 */
client.on('message', async message => {
    // Ignore bot messages and messages that dont start with the prefix defined in the config file
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    // Split commands and arguments from message so they can be passed to functions
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // If the command isn't in the  command folder, move on
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if(!command) return;

        // If the command requires arguments, make sure they're there.
        if (command.args && !args.length) {
            let reply = 'That command requires more details!';

            // If we have details on how to use the args, provide them
            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            // Send a reply from the bot about any error encountered
            return message.channel.send(reply);
        }

    /**
     * The following block of code handles "cooldowns" making sure that users can only use a command every so often.
     * This is helpful for commands that require loading time or computation, like image requests.
     */
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
            return message.reply(`Whoa! You're sending commands too fast! Please wait ${timeLeft.toFixed(1)} more second(s) before running \`${command.name}\` again!`);
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
    }
    /**
     * End cooldown code, begin checking if the user has the right permissions.
     */

    if(command.perms) {
      if(message.channel.type == "dm") {
        if(['admin','dev'].includes(command.perms) && (message.author.id != perms.dev)) {
          reply = 'You do not have permission to use this command!';
          return message.reply(reply);
        }
      } else if (message.channel.guild.id != '749880737712308274' && message.channel.guild.id != '439874403849863169') {
        if(!(message.author.id == perms[command.perms])) {
          if(!(message.member.roles.cache.find(r => r.id == perms[command.perms]))) {
            reply = 'You do not have permission to use this command!';
            return message.reply(reply);
          }
        }
      }
    }

    try {
        // Run the command
        if (command.database == true) {
            await command.execute(message, db, args);
        } else {
            if (command.client == true) {
                await command.execute(message, client, args);
            } else {
                await command.execute(message, args);
            }
        }
    } catch(error) {
        console.error(error);
        message.reply('Sorry! I ran into an error trying to do that!');
        const dev = client.users.cache.get(perms.dev);
        const msg = (message.content.length > 200) ? message.content.slice(0,200) + ' [...]' : message.content;
        const errmsg = (error.stack.toString().length > 1500) ? error.stack.toString().slice(0,1500) + '...' : error.stack;
        dev.send('Error running command: `'+msg+'`\nSender: `'+message.author.username+'#'+message.author.discriminator+'` from `'+message.guild.name+'`\nError Report:\n```'+errmsg+'```');
    }
});

client.login(process.env.TOKEN).catch((err)=>console.error(err)); // Log the bot in using the token provided in the .env file
