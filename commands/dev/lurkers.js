module.exports = {
    name: 'lurkers', // The name of the command
    description: 'Runs the command to prune lurkers!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    allowDM: true,
    group: 'dev',
    cooldown: 10,
    execute(message, args) {
      const lurkerFunc = require('./../../guild_auto_prune.js'); // load prune code
      return lurkerFunc(message.client);
    },
};
