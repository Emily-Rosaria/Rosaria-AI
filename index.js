require('dotenv').config(); //for .env file
/*
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
*/
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
var cron = require('node-cron'); // run regular scheduled tasks

const config = require('./config.json');

const dev = config.perms.dev[0];

const mongoose = require("mongoose"); //database library

const connectDB = require("./database/connectDB.js"); // Database connection
var database = "rose"; // Database name

const client = new Discord.Client({ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'] }, retryLimit: 3, restRequestTimeout: 25000}); // Initiates the client

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

// Creates an empty list for storing timeouts so people can't spam with commands
client.cooldowns = new Discord.Collection();

// load the core events into client
client.events = new Discord.Collection();
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    client.events.set(event.name, event);
}


// Starts the bot and makes it begin listening for commands.
client.on('ready', async function() {
  client.user.setPresence({ activity: { type: 'PLAYING', name: 'with my adorable subjects' }, status: 'online' });
  console.log(`${client.user.username} is up and running! Launched at: ${(new Date()).toUTCString()}.`);
  cron.schedule('0 20 * * *', async () => { // remind people at 8pm
    var prune = require('./guild_auto_prune.js');
    try {
      prune(client);
    } catch (err) {
      console.error(err);
    }
  });
});

client.on('message', async message => {
    if (message && message.author && message.author.bot) {
      return;
    }
    client.events.get("onMessage").event(message);
});

client.on('messageDelete', async message => {
    if (message.author && message.author.bot) {return} // don't respond to bots
    client.events.get("onDelete").event(message);
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage.author && newMessage.author.bot) {return} // don't respond to bots
    client.events.get("onEdit").event(oldMessage, newMessage);
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) {return}
    client.events.get("onReactionAdd").event(reaction, user);
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) {return}
    client.events.get("onReactionRemove").event(reaction, user);
});

client.on('messageReactionRemoveEmoji', async (reaction) => {
    client.events.get("onReactionTake").event(reaction);
});

client.on('messageReactionRemoveAll', async (message) => {
    client.events.get("onReactionClear").event(message);
});

client.on('guildMemberAdd', async member => {
  if (member.guild.id == config.guild) {
    client.events.get("onMemberAdd").event(message);
  }
});

client.on('guildMemberRemove', async member => {
  if (member.guild.id == config.guild) {
    client.events.get("onMemberRemove").event(message);
  }
});

connectDB("mongodb://localhost:27017/"+database);
client.login(process.env.TOKEN); // Log the bot in using the token provided in the .env file
