const config = require('./lewd_prompts.json');
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
    name: 'encounter', // The name of the command
    aliases: ['bondage','bind','prompt'],
    description: 'Generate a random bondage encounter for Rosaria!', // The description of the command (for help text)
    perms: 'verified', //restricts to bot dev only (me)
    usage: '<@user>', // Help text to explain how to use the command (if it had any arguments)
    allowDM: true,
    rose: true,
    execute(message, args) {
      var member = message.member;
      if (args && args.length > 0 && message.channel.type != "dm") {
        var tempID = args[0].match(/\d{17,23}/);
        if (tempID && tempID.length > 0) {
          tempID = tempID[0];
          const tempMember = message.guild.members.resolve(tempID);
          if (tempMember) {
            member = tempMember;
          }
        }
      }
      var user = member ? member.user : message.author;
      //const bindings = config.bindings;
      //const options = shuffle(Object.keys(config.bindings));
      //const count = 3 + Math.floor(Math.random()*3);
      const name = member ? member.displayName : user.username;
      const avatar = user.avatarURL();
      const color = member ? member.displayHexColor : "#f51d75";
      const villain = resolve(config.villain);
      const adjective = resolve(config.adjective);
      const verb = resolve(config.verb);
      const material = resolve(config.material);
      const desc = `The ${villain} tries to ${verb} ${name} with... ${material}.`;
      const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`${name} encounters... ${adjective} ${villain}!`)
        .setDescription(desc)
        .setFooter("Use the `$encounter` command.");
      if (avatar) {
        embed.setAuthor(name,avatar);
      } else {
        embed.setAuthor(name);
      }
      message.channel.send(embed);
    },
};
