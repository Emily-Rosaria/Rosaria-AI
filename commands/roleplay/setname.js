const Users = require("./../../database/models/users.js"); // users model
const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config

module.exports = {
    name: 'setname', // The name of the command
    aliases: ['myname','name'],
    description: 'Set your name stored in the bot. Write what you\'d like to be refered to within the bot and Rosaria.', // The description of the command (for help text)
    perms: 'basic', //restricts to bot dev only (me)
    usage: '<name>', // Help text to explain how to use the command (if it had any arguments)
    allowDM: true,
    group: 'Work In Progress',
    rose: true,
    execute(message, args) {
      var userID = message.author.id;
      if (args.length > 0) {
        const name = message.content.replace(/^\S+/i,'').trim().substring(0, 30).split(/\n/).map(s=>s.trim()).join(' ');
        var options = { upsert: true, setDefaultsOnInsert: true };
        var update = {};
        update.name = name;
        update = {"$set":update};
        const data = Users.findOneAndUpdate({_id: message.author.id},update,options).exec();
        return message.reply(`Your name has been updated! It will be shown when someone uses \`${config.prefix[0]}intro\` command to view your intro, and with some other similar commands.`);
      } else {
        return message.reply(`Use this command to update your name stored in the bot! For example, \`$setname Emily\`. It will then be shown in the \`$intro\` command, as well as some other locations.`);
      }
    },
};
