/**
 * Runs the help command, explaining each available command to the user.
 */

const config = require('./../../config.json'); // load bot config
const Discord = require('discord.js'); // Image embed

module.exports = {
    name: 'help',
    description: 'List all available commands, or info about a specific command.',
    aliases: ['commands','info'],
    perms: false, //no user-based restrictions
    usage: '<command name>',
    cooldown: 5,
    allowDM: true,
    group: 'util',
    async execute(message, args) {
        const prefix = message.guild && message.guild.id == "749880737712308274" ? "r!" : config.prefix[0];

        const { commands } = message.client;

        // Send help data about ALL commands
        if(!args.length) {
          const filtered = commands.filter(c=>{
            if (c.rose && message.guild && message.guild.id != config.guild) {
              return false;
            }
            if (c.perms && c.perms == 'dev' && !config.perms.dev.includes(message.author.id)) {
              return false;
            }
            return true;
          });

          const mapped = filtered.reduce((acc,cur)=>{
            let temp = acc;
            const starred = !cur.allowDM ? '*' : '';
            if (cur.group) {
              temp[cur.group] = (temp[cur.group] || []).concat(cur.name+starred);
            } else {
              temp.misc = (temp.misc || []).concat(cur.name+starred);
            }
            return temp;
          },{});

          const embed = new Discord.MessageEmbed()
          .setColor('#f51d75')
          .setDescription(`Here\'s a list of all my available commands. You can send \`${prefix}help [command name]\` to get info on a specific command! Note, commands marked with a \`*\` are not available in DMs.`)
          .setTitle(`${message.client.user.username}'s Command List`)
          .setTimestamp()

          for (const key of [...Object.keys(mapped)]) {
            const cmds = mapped[key].sort();
            embed.addField(key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),cmds.join(', '));
          }

          return message.channel.send(embed);
        }

        // Send help data about the specific command
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
          return message.reply('that\'s not a valid command!');
        }

        const embed = new Discord.MessageEmbed()
        .setColor('#f51d75')
        .setTitle(`Help: ${prefix}${command.name}`)
        .setTimestamp()

        if (command.description) embed.setDescription(command.description);

        if (command.aliases) embed.addField("Aliases",`${command.aliases.join(', ')}`);
        if (command.usage) {
          embed.addField("Usage",`\`${prefix}${command.name} ${command.usage}\``);
        } else {
          embed.addField("Usage",`\`${prefix}${command.name}\``);
        }

        message.channel.send(embed);
    },
};
