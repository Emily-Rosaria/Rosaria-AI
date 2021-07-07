const Damsels = require('./../../database/models/damsels.js');

module.exports = {
    name: 'dungeon', // The name of the command
    description: 'Provide help for entering the kinky dungeon on Rosaria!', // The description of the command (for help text)
    perms: 'basic',
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    allowDM: false,
    rose: true,
    execute(message, args) {
      if (!message.guild || message.guild.id != '727569853405200474') {
        return;
      }
      message.reply("Help text for this command will be added shortly. Use the `$damsel` command to configure a character. Characters may be of any gender.");
    },
};
