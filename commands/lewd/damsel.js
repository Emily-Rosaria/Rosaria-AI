const Damsels = require('./../../database/models/damsels.js');

module.exports = {
    name: 'damsel', // The name of the command
    description: 'Format an easily accessed character sheet to share with others!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    allowDM: true,
    rose: true,
    execute(message, args) {

      message.reply("This command is work in progress right now, sorry.");
    },
};
