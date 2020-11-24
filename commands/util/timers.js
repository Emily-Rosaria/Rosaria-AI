
module.exports = {
  name: 'timers', // The name of the command
  description: 'Resets the cooldowns of someone.', // The description of the command (for help text)
  perms: 'verified', //restricts to bot dev only (me)
  database: true,
  aliases: ['gettimers','get-timers'],
  args: false,
  async execute(message, db, args) {
    user = !!args[0] ? message.client.users.cache.get(args[0].match(/\d+/)[0]) || message.author : message.author;
    const timerJSON = await db.get("timers_"+user.id).then((timer) => JSON.parse(timer)).catch(() => {});
    if (JSON.stringify(timerJSON) === '{}' || timerJSON===null || timerJSON===undefined) {
      message.reply('There are no timers stored for '+user.username+'#'+user.discriminator+' in the bot\'s database.');
      return;
    }
    const msg = JSON.stringify(Object.keys(timerJSON).reduce((acc,key)=>{
      const date = new Date(timerJSON[key]).toGMTString();
      let temp = acc;
      temp[key] = {"dateString":date,"dateEpoch":timerJSON[key]};
      return temp;
    },{}),undefined, 2);
    message.reply('The stored timers for '+user.username+'#'+user.discriminator+' are noted below. Know that this data is formatted for admin purposes, rather than for usability.\n```json\n'+msg+'\n```');
  },
};