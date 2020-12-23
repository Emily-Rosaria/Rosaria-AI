module.exports = {
  name: 'uptime', // The name of the command
  description: 'Shows how long the bot has been running without incident.', // The description of the command (for help text)
  perms: 'basic',
  aliases: ['boottime'],
  args: false,
  allowDM: true,
  async execute(message, args) {
    const toDuration = require('./../../misc_functions/toDuration.js');
    const launchTime = message.client.bootTime;
    const now = (new Date()).getTime();
    const diffString = toDuration(now - launchTime);
    message.channel.send("The bot has been up for `"+diffString+"`.");
  },
};
