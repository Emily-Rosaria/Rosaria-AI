const Users = require("./../../database/models/users.js"); // users model
const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config

module.exports = {
    name: 'setintro', // The name of the command
    aliases: ['setbio','introset'],
    description: 'Set your public OOC introduction text for Rosaria!', // The description of the command (for help text)
    perms: 'basic', //restricts to bot dev only (me)
    usage: '<new-intro>', // Help text to explain how to use the command (if it had any arguments)
    allowDM: true,
    group: 'Community',
    rose: true,
    execute(message, args) {
      var userID = message.author.id;
      if (args.length > 0) {
        const intro = message.content.replace(/^\S+/i,'').trim();
        var options = { upsert: true, setDefaultsOnInsert: true };
        var update = {};
        update.intro = intro.substring(0,4096);
        update = {"$set":update};
        const data = Users.findOneAndUpdate({_id: message.author.id},update,options).exec();
        return message.reply(`Your intro has been updated! You can use \`${config.prefix[0]}intro\` to view it, and others can access it quickly with \`${config.prefix[0]}intro ${message.author.tag}\``);
      } else {
        return message.reply(`Use this command to update your introduction stored in the bot! For example, \`${config.prefix[0]}setintro Hiya! I'm Emily and I'm...\`. It can then be accessed through the \`$intro\` command.`);
      }
    },
};
