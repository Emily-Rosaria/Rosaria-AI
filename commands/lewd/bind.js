const config = require('./config.json');
const Discord = require('discord.js'); // Image embed

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function resolve(a) {
    var result = a;
    while (typeof result != "string") {
      if (Array.isArray(result)) {
        result = result[Math.floor(Math.random()*result.length)];
      } else {
        break;
      }
    }
    return result;
}

module.exports = {
    name: 'bind', // The name of the command
    aliases: ['bondage','encounter'],
    description: 'Generate a random bondage trap/encounter!', // The description of the command (for help text)
    perms: 'verified', //restricts to bot dev only (me)
    usage: '<@user>', // Help text to explain how to use the command (if it had any arguments)
    allowDM: false,
    execute(message, args) {
      if (!message.guild || message.guild.id != '727569853405200474') {
        return;
      }
      var member = message.member;
      if (args && args.length > 0) {
        var tempID = args[0].match(/\d{17,23}/);
        if (tempID && tempID.length > 0) {
          tempID = tempID[0];
          const tempMember = message.guild.members.resolve(tempID);
          if (tempMember) {
            member = tempMember;
          }
        }
      }
      //const bindings = config.bindings;
      //const options = shuffle(Object.keys(config.bindings));
      //const count = 3 + Math.floor(Math.random()*3);
      const name = member.displayName;
      const villain = resolve(config.villain);
      const adjective = resolve(config.adjective);
      const material = resolve(config.material);
      const desc = `The ${villain} subdues (or plans to subdue) ${name} with... ${material}.`;
      const embed = new Discord.MessageEmbed()
        .setColor(member.displayHexColor)
        .setTitle(`${name} encounters... ${adjective} ${villain}!`)
        .setDescription(desc)
        .setFooter("Use the `$encounter` command.");
      message.channel.send(embed);
    },
};
