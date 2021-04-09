/**
 * This class responds to any dev that types r!kill by killing an interval.
 *
 */

module.exports = {
    name: 'test', // The name of the command
    description: 'Test the prune function', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    args: false,
    allowDM: true,
    execute(message, args) {
      var prune = require('./../../guild_auto_prune.js');
      prune(message.client);
    }
};
