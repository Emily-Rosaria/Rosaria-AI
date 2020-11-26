/**
 * This class responds to any verified user by listing all intervals.
 *
 */

module.exports = {
    name: 'intervals', // The name of the command
    description: 'Lists all running timeouts and intervals.', // The description of the command (for help text)
    perms: 'dev', //restricts to verified users
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    execute(message, args) {
      keys = Array.from(message.client.spawnloops.keys());
      message.channel.send('Current running intervals include...\n'+keys.join(', ')+'.');
    },
};
