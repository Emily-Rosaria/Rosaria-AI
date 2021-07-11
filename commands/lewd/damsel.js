const Damsels = require('./../../database/models/damsels.js');
const config = require('./lewd_prompts.json');
const Discord = require('discord.js'); // Image embed

module.exports = {
    name: 'damsel', // The name of the command
    description: 'Create a damsel character for kinky minigames!', // The description of the command (for help text)
    perms: 'basic', //restricts to bot dev only (me)
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    allowDM: true,
    rose: true,
    async execute(message, args) {

      const template = {
        _id: message.author.id,
        name: "",
        pronouns: "she/her/her/hers",
        stats: {
          arcane: 0,
          deftness: 0,
          endurance: 0,
          strength: 0,
          mind: 0
        },
        bars: {
          mana: 100,
          stamina: 100,
          composure: 100,
          arousal: 0,
          willpower: 100
        },
        spells: [],
        tokens: 0,
        xp: 0,
        status: [],
        blacklist: [],
        registrationDate: (new Date()).getTime()
      };

      const damsel = await Damsels.findById(message.author.id) || template;

      const embed = new Discord.MessageEmbed()
      .setColor('f51d75')
      .setTitle("Damsel Creation!")
      .setDescription("Work in progress");
      message.reply(embed);
    },
};
