/**
 * This class responds to anyone that types r!cat with a cat image.
 *
 */
const Discord = require('discord.js'); // Image embed
const fetch = require('node-fetch'); // This lets me get stuff from api.

module.exports = {
    name: 'cat', // The name of the command
    description: 'Get random cat pics!', // The description of the command (for help text)
    args: false, // Specified that this command doesn't need any data other than the command
    allowDM: true,
    perms: 'basic', //restricts to users with the "verifed" role noted at config.json
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    group: 'fun',
    async execute(message, args) {

        // Get cat from the random.cat api.
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        const embed = new Discord.MessageEmbed().setImage(file).setTitle('Cat').setFooter('Source: aws.random.cat').setTimestamp();
        message.reply({ embeds: [embed]}); // Replies to the user with a random cat
    },
};
