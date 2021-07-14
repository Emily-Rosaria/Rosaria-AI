const Users = require("./../../database/models/users.js"); // users model
const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config

module.exports = {
    name: 'setlimits', // The name of the command
    aliases: ['myblacklist','setblacklist','mylimits','setbanlist','mybanlist'],
    description: 'Store a list of your limits or turnoffs in the bot for quick-reference!', // The description of the command (for help text)
    perms: 'basic', //restricts to bot dev only (me)
    usage: '<kinks>', // Help text to explain how to use the command (if it had any arguments)
    allowDM: true,
    group: 'Community',
    rose: true,
    execute(message, args) {
      var userID = message.author.id;
      if (args.length > 0) {
        const intro = message.content.replace(/^\S+/i,'').trim();
        var options = { upsert: true, setDefaultsOnInsert: true };
        var update = {};
        update.blacklist = intro.substring(0,2048);
        update = {"$set":update};
        const data = Users.findOneAndUpdate({_id: message.author.id},update,options).exec();
        return message.reply(`Info about your limits have been updated! You can use \`${config.prefix[0]}kinky\` to view it, and others can access it quickly with \`${config.prefix[0]}kinky ${message.author.tag}\``);
      } else {
        return message.reply(`Use this command to update your limit/blacklist-based introduction stored in the bot! For example, \`${config.prefix[0]}setlimits I don't like chains, and prefer rope\`. It can then be accessed through the \`$kinky\` command, along with your kinks (if any, see \`${config.prefix[0]}setkinks\`).`);
      }
    },
};
