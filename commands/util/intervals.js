/**
 * This class responds to any verified user by listing all intervals.
 *
 */

module.exports = {
    name: 'intervals', // The name of the command
    description: 'Lists all running intervals.', // The description of the command (for help text)
    perms: 'verified', //restricts to verified users
    client: true,
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    execute(message, client, args) {
      keys = Array.from(client.intervals.keys());
      message.channel.send('Current running intervals include...\n'+keys.join(', ')+'.');
    },
};