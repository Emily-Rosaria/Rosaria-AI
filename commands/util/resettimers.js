module.exports = {
  name: 'resettimers', // The name of the command
  description: 'Resets the cooldowns of someone.', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  aliases: ['reset-timers'],
  database: true,
  usage: '[user-to-reset]', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, db, args) {
    user = !!args[0] ? message.client.users.cache.get(args[0].match(/\d+/)[0]) || message.author : message.author;
    await db.set("timers_" + user.id,JSON.stringify({}));
    message.reply("Done! Reset the timers of: "+user.username+"#"+user.discriminator+" (ID: "+user.id+").");
  },
};