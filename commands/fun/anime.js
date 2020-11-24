
/**
 * This class responds to anyone that types r!anime with an anime image.
 *
 */
const Discord = require('discord.js'); // Image embed
const Booru = require('booru'); // This lets me get stuff from weeb sites.

module.exports = {
    name: 'anime', // The name of the command
    description: 'Get random anime pics from safebooru!', // The description of the command (for help text)
    args: false, // Specified that this command doesn't need any data other than the command
    perms: 'verified', //restricts to users with the "verifed" role noted at config.json
    usage: '[image-tag 1] [image-tag 2] [...]', // Help text to explain how to use the command (if it had any arguments)
    async execute(message, args) {
        // Get image from the api.
        tags = args || ['all'];
        const image = await Booru.search('safebooru', tags, { limit: 1, random: true });
        const embed = new Discord.MessageEmbed()
        .setColor('#2e51a2')
        .setImage(image[0].fileUrl)
        .setFooter('Image from safebooru')
        .setTimestamp()
        message.reply(embed); // Replies to the user with a random image
    },
};