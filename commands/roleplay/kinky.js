const Users = require("./../../database/models/users.js"); // users model
const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config
const Discord = require('discord.js'); // Image embed

module.exports = {
    name: 'kinky', // The name of the command
    aliases: ['kinks','limits','blacklist','turnons','turnoffs','kinklist'],
    description: 'Get information about another user\'s kinks and limits, if they\'ve input it into the bot.', // The description of the command (for help text)
    perms: 'basic', //restricts to bot dev only (me)
    usage: '<user-mention|user-id|username|nickname>', // Help text to explain how to use the command (if it had any arguments)
    allowDM: true,
    group: 'Community',
    rose: true,
    async execute(message, args) {
      if (args.length > 0) {
        let uID;
        let member;
        let data;
        if (args.length > 1 || args[0].search(/\d{15,23}/) == -1) {
          const regex = new RegExp(`${args.join(' *')}.*`);
          data = await Users.findOne({name: { $regex: regex, $options: 'i' }}).exec();
          if (!data) {
            const members = await message.client.guilds.resolve(config.guild).members.fetch({query:`${args.join(' ')}`});
            if (members && members.size > 0) {
              member = members.first();
              uID = member.user.id;
              data = await Users.findById({_id: uID}).exec();
            }
          } else {
            uID = data._id;
            member = await message.client.guilds.resolve(config.guild).members.fetch({user: uID});
          }
        } else {
          uID = args[0].match(/\d{15,23}/);
          if (uID && Number(uID) < Number(message.id)) {
            uID = uID[0];
            member = await message.client.guilds.resolve(config.guild).members.fetch({user: uID});
            data = await Users.findById({_id: uID}).exec();
          }
        }
        if (data && (data.kinks || data.blacklist)) {
          const name = data.name || (member && member.id ? member.displayName : "Unknown User");
          const kinks = (data.kinks || "").substring(0,2048);
          const limits = (data.blacklist || "").substring(0,2048);
          let desc = "";
          let fields = [];
          const embed = new Discord.MessageEmbed()
          .setTitle(`${name}'s Kink Information`)
          if (kinks) {
            if (kinks.length > 1020) {
              desc = "**Kinks:**\n"+data.kinks;
            } else {
              fields.push({name:"Kinks",value:kinks});
            }
          } else {
            fields.push({name:"Kinks",value:"This user has not provided any information about their kinks/turnons."});
          }
          if (limits) {
            if (limits.length > 1020 || desc) {
              if (desc) {
                desc = desc.trim() + "\n\n**Limits & Turnoffs:**\n" + data.blacklist;
              } else {
                desc = "**Kinks:**\n"+data.kinks+"\n\n**Limits & Turnoffs:**\n" + data.blacklist;
              }
            } else {
              fields.push({name:"Limits & Turnoffs",value:limits});
            }
          } else {
            fields.push({name:"Limits & Turnoffs",value:"This user has not provided any information about their limits/turnoffs."});
          }
          if (desc) {
            embed.setDescription(desc.substring(0,4096));
          } else {
            embed.addFields(fields);
          }
          if (member && member.id) {
            embed.setAuthor(name, member.user.displayAvatarURL({size:64,format:'png'})).setColor(member.displayHexColor);
          } else {
            embed.addField("Notice",`I was unable to find <@${data._id}> on the Rosaria discord. This may be due to lag, but it's possible that they have left.`);
          }
          return message.reply(embed);
        } else {
          if (member && member.id) {
            return message.reply(`The user \`${member.user.tag}\` does not have an introduction stored in the bot. They'll need to use the \`$setintro\` command to set it.`);
          } else {
            return message.reply(`I was unable to find a user with that name, tag, or ID on Rosaria or within my database. Are you sure you wrote their name correctly? And that they're still on the server.`);
          }
        }
      } else {
        const data = await Users.findById({_id: message.author.id}).exec();
        if (data.kinks || data.blacklist) {
          let member = message.member;
          if (!member) {
            member = await message.client.guilds.resolve(config.guild).members.fetch({user: message.author});
          }
          const name = data.name || (member ? member.displayName : message.author.username);
          const kinks = (data.kinks || "").substring(0,2048);
          const limits = (data.blacklist || "").substring(0,2048);
          let desc = "";
          let fields = [];
          const embed = new Discord.MessageEmbed()
          .setTitle(`${name}'s Kink Information`)
          .setAuthor(name, message.author.displayAvatarURL({size:64,format:'png'}));
          if (member) {
            embed.setColor(member.displayHexColor);
          }
          if (kinks) {
            if (kinks.length > 1020) {
              desc = "**Kinks:**\n"+data.kinks;
            } else {
              fields.push({name:"Kinks",value:kinks});
            }
          } else {
            fields.push({name:"Kinks",value:"This user has not provided any information about their kinks/turnons."});
          }
          if (limits) {
            if (limits.length > 1020 || desc) {
              if (desc) {
                desc = desc.trim() + "\n\n**Limits & Turnoffs:**\n" + data.blacklist;
              } else {
                desc = "**Kinks:**\n"+data.kinks+"\n\n**Limits & Turnoffs:**\n" + data.blacklist;
              }
            } else {
              fields.push({name:"Limits & Turnoffs",value:limits});
            }
          } else {
            fields.push({name:"Limits & Turnoffs",value:"This user has not provided any information about their limits/turnoffs."});
          }
          if (desc) {
            embed.setDescription(desc.substring(0,4096));
          } else {
            embed.addFields(fields);
          }
          return message.reply(embed);
        } else {
          return message.reply(`Use this command to access the kink/limit introduction of someone stored in the bot! For example, \`${config.prefix[0]}kinky Emily Rose\` will try to find someone called "Emily Rose" and their corresponding kink information. To set your own info, do \`${config.prefix[0]}setkinks <kink-info>\` and \`${config.prefix[0]}setlimits <kink-info>\` without the \`<>\`.`);
        }
      }
    },
};
