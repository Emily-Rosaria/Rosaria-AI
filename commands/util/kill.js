/**
 * This class responds to any dev that types r!kill by killing an interval.
 *
 */

module.exports = {
    name: 'kill', // The name of the command
    description: 'Kills a timeout/interval (e.g. pokemon spawners)!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    usage: '<interval-to-kill>', // Help text to explain how to use the command (if it had any arguments)
    args: true,
    execute(message, args) {
      let client = message.client;
      const keys = Array.from(client.spawnloops.keys());
      if (client.spawnloops.get(args[0])) {
        client.clearInterval(client.spawnloops.get(args[0]));
        client.spawnloops.delete(args[0]);
        client.spawnloops.array();
        message.channel.send('Press F to pay respects... RIP for '+args[0]+'.');
      } else {
        if (keys.length == 1) {
          message.channel.send('Invalid interval. Current running intervals include...\n'+keys.join(', ')+'.');
        }
      }
    },
};
