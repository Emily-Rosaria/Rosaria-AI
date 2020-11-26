const Trainers = require("./models/trainers.js");

module.exports = {
  name: 'resettimers', // The name of the command
  description: 'Resets the cooldowns of someone.', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  usage: '[user-to-reset]', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    user = !!args[0] ? message.client.users.cache.get(args[0].match(/\d+/)[0]) || message.author : message.author;
    const res = await Trainers.updateMany({id : user.id}, {cooldowns: {}}).exec();
    message.reply("Done! Reset the timers of: "+user.username+"#"+user.discriminator+" (ID: "+user.id+").");
  },
};
