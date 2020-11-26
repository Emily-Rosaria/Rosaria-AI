const Trainers = require("./models/trainers.js");
const Discord = require('discord.js'); // Image embed

module.exports = {
  name: 'timers', // The name of the command
  description: 'Gets the timers of someone.', // The description of the command (for help text)
  perms: 'basic', //restricts to bot dev only (me)
  aliases: ['gettimers'],
  args: false,
  allowDM: true,
  async execute(message, args) {
    const user = !!args[0] ? message.client.users.cache.get(args[0].match(/\d+/)[0]) || message.author : message.author;
    const timers = await Trainers.findOne({ id: user.id }).exec().then(d=>d.timers).catch((err)=>{
      message.reply("There are no stored timers for "+user.username+'#'+user.discriminator+".");
    })
    const now = new Time.now().getTime();
    const toDuration = require('./../../misc_functions/toDuration.js');
    timerArray = timers.entries().map(e => {
      const timeDiff = e[1] - now;
      if (e[1] - now < 0) {return "☑️ The cooldown for "+e[0]+" has expired!"}
      return "⏲️ "+e[0]+"'s cooldown will reset in "+toDuration(timeDiff)+".";
    });
    const embed = new Discord.MessageEmbed()
      .setColor('#6699cc')
      .setTitle('Cooldowns of '+user.username)
      .setAuthor(user.username, user.author.displayAvatarURL())
      .setDescription(timerArray.join('\n'))
      .setTimestamp()
      .setFooter('Requested by '+user.username+'#'+user.discriminator);
    message.channel.send(embed);
  },
};
