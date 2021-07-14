const Users = require("./../../database/models/users.js"); // users model
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
        if (data && data.intro) {
          const name = data.name || (member && member.id ? member.displayName : "Unknown User");
          const intro = data.intro;
          const embed = new Discord.MessageEmbed()
          .setTitle(`${name}'s Introduction`)
          .setDescription(data.intro)
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
        if (data.intro && data.intro != '') {
          let member = message.member;
          if (!member) {
            member = await message.client.guilds.resolve(config.guild).members.fetch({user: message.author});
          }
          const name = data.name || (member ? member.displayName : message.author.username);
          const intro = data.intro;
          const embed = new Discord.MessageEmbed()
          .setTitle(`${name}'s Introduction`)
          .setDescription(data.intro)
          .setAuthor(name, message.author.displayAvatarURL({size:64,format:'png'}));
          if (member) {
            embed.setColor(member.displayHexColor);
          }
          return message.reply(embed);
        } else {
          return message.reply(`Use this command to access the introduction of stored in the bot! For example, \`${config.prefix[0]}intro Emily Rose\` will try to find someone called "Emily Rose" and their corresponding introduction. To set your own intro, do \`${config.prefix[0]}setintro <introduction>\` without the \`<>\`.`);
        }
      }
    },
};
