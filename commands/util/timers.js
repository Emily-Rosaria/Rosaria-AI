const Trainers = require('./../../database/models/trainers.js');
const Discord = require('discord.js'); // Image embed

module.exports = {
  name: 'timers', // The name of the command
  description: 'Gets the timers of someone.', // The description of the command (for help text)
  perms: 'basic', //restricts to bot dev only (me)
  aliases: ['gettimers','cooldowns'],
  args: false,
  allowDM: true,
  async execute(message, args) {
    const user = !!args[0] ? message.client.users.cache.get(args[0].match(/\d+/)[0]) || message.author : message.author;
    const userData = await Trainers.findById(user.id).exec().catch((err)=>{
      return message.reply("There are no stored timers for "+user.username+'#'+user.discriminator+".");
    });
    const timerText1 = new Map([['pokecatch','You\'re well rested now! You can go out to catch some pokemon!'],['daily','Your daily bonus is ready: use `r!daily` to claim it!']]);
    const timerText2 = new Map([['pokecatch','Rest a little before catching Pokémon again. You should relax for at least `$time$`.'],['daily','You\'ve already claimed your daily bonus today. It resets in `$time$`.']]);
    const now = (new Date()).getTime();
    const toDuration = require('./../../misc_functions/toDuration.js');
    timerArray = Array.from(userData.cooldowns).map(e => {
      const timeDiff = e[1] - now;
      if (timeDiff < 0) {
        if (timerText1.has(e[0])) {
          return ("☑️ "+timerText1.get(e[0]));
        } else {
          return ("☑️ The cooldown for "+e[0]+" has expired!")
        }
      } else {
        if (timerText2.has(e[0])) {
          return ("⏲️ "+timerText2.get(e[0]).replace("$time$",toDuration(timeDiff)));
        } else {
          return ("⏲️ "+e[0]+"'s cooldown will reset in ``"+toDuration(timeDiff)+"``.");
        }
      }
    });
    const embed = new Discord.MessageEmbed()
      .setColor('#6699cc')
      .setTitle('Cooldowns of '+user.username)
      .setAuthor(user.username, user.displayAvatarURL())
      .setDescription(timerArray.join('\n'))
      .setTimestamp()
      .setFooter('Requested by '+user.username+'#'+user.discriminator);
    message.channel.send(embed);
  },
};
