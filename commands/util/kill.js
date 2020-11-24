/**
 * This class responds to any dev that types r!kill by killing an interval.
 *
 */

module.exports = {
    name: 'kill', // The name of the command
    description: 'Kills an interval!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    usage: '<interval-to-kill>', // Help text to explain how to use the command (if it had any arguments)
    args: true,
    client: true,
    execute(message, client, args) {
        keys = Array.from(client.intervals.keys());
        if (client.intervals.get(args[0])) {
            console.log(client.intervals.get(args[0]));
            client.clearInterval(client.intervals.get(args[0]));
            client.intervals.delete(args[0]);
            client.intervals.array();
            message.channel.send('Press F to pay respects... RIP for '+args[0]+'.');
        } else {
            if (keys.length == 1) {
              message.channel.send('Invalid interval. Current running intervals include...\n'+keys.join(', ')+'.');
            }
        }
        console.log(client.intervals);
    },
};