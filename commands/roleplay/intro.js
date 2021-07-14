const Docs = require("./../../database/models/documents.js"); // users model
const mongoose = require("mongoose"); //database library
const config = require('./../../config.json'); // load bot config
const Discord = require('discord.js'); // Image embed

module.exports = {
    name: 'intro', // The name of the command
    aliases: ['bio','getintro','getbio'],
    description: 'Set your public OOC introduction text for Rosaria!', // The description of the command (for help text)
    perms: 'basic', //restricts to bot dev only (me)
    usage: '<user-mention|user-id|username|nickname>', // Help text to explain how to use the command (if it had any arguments)
    allowDM: true,
    group: 'Work In Progress',
    rose: true,
    async execute(message, args) {
      if (args.length > 0) {
        let uID;
        let member;
        let data;
        if (args.length > 1 || !args[0].match(/\d{15,23}/) || (message.mentions && (message.mentions.members && message.mentions.members.size == 0 && message.mentions.users && message.mentions.users.size == 0))) {
          const regex = new RegExp(`${args.join(' *')}.*`);
          data = await Users.findOne({name: { $regex: regex, $options: 'i' }}).exec();
          if (!data) {
            member = await message.client.guilds.resolve(config.guild).members.fetch({query:`${args.join(' ')}`});
            if (user) {
              uID = user.id;
              data = await Users.findById({_id: uID}).exec();
            }
          } else {
            uID = data._id;
            member = await message.guilds.resolve(config.guild).members.fetch(uID);
          }
        } else {
          uID = args[0].match(/\d{15,23}/);
          member = await message.guilds.resolve(config.guild).members.fetch(uID);
          data = await Users.findById({_id: uID}).exec();
        }
        if (data && data.intro) {
          const name = data.name || (member ? member.displayName : "Unknown User");
          const intro = data.intro;
          const embed = new Discord.MessageEmbed()
          .setColor(message.member.displayHexColor)
          .setTitle(`Introduction of ${name}`)
          .setDescription(data.intro)
          if (member) {
            embed.setAuthor(name, message.author.displayAvatarURL({size:64,format:'png'}));
          } else {
            embed.addField("Notice",`I was unable to find <@${data._id}> on the Rosaria discord. This may be due to lag, but it's possible that they have left.`);
          }
          return message.reply(embed);
        } else {
          if (member) {
            return message.reply(`The user \`${member.user.tag}\` does not have an introduction stored in the bot. They'll need to use the \`$setintro\` command to set it.`);
          } else {
            return message.reply(`I was unable to find a user with that name, tag, or ID on Rosaria or within my database. Are you sure you wrote their name correctly, and that they're still on the server.`);
          }
        }
      } else {
        const data = await Users.findById({_id: message.author.id}).exec();
        if (data.intro && data.intro != '') {
          const name = data.name || message.member.displayName;
          const intro = data.intro;
          const embed = new Discord.MessageEmbed()
          .setColor(message.member.displayHexColor)
          .setTitle(`Introduction of ${name}`)
          .setDescription(data.intro)
          .setAuthor(name, message.author.displayAvatarURL({size:64,format:'png'}));
          return message.reply(embed);
        } else {
          return message.reply(`Use this command to access the introduction of stored in the bot! For example, \`${config.prefix[0]}intro Emily Rose\` will try to find someone called "Emily Rose" and their corresponding introduction. To set your own intro, do \`${config.prefix[0]}setintro [introduction]\` without the \`[]\`.`);
        }
      }
    },
};
