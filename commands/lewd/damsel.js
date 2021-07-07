const Damsels = require('./../../database/models/damsels.js');

module.exports = {
    name: 'damsel', // The name of the command
    description: 'Create a character for Rosaria\'s kinky dungeon, or view info about your current character!', // The description of the command (for help text)
    perms: 'basic', //restricts to bot dev only (me)
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    allowDM: false,
    rose: true,
    execute(message, args) {
      if (!message.guild || message.guild.id != '727569853405200474') {
        return;
      }
      message.reply("This command is work in progress right now, sorry.");
    },
};
