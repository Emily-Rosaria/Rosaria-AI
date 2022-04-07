
/**
 * This class responds to anyone that types r!ribbons with an anime ribbondage lewd.
 *
 */

const Discord = require('discord.js'); // Image embed
const Booru = require('booru'); // This lets me get stuff from weeb sites.

module.exports = {
    name: 'ribbons', // The name of the command
    description: 'Get random anime girls... wrapped up with ribbons!', // The description of the command (for help text)
    usage: '[lewd/safe, defaults to channel\'s nsfw rating>]',
    allowDM: true,
    perms: 'basic', //restricts to users with the "verifed" role noted at config.json
    group: 'fun',
    rose: true,
    async execute(message, args) {
        // Get image from the api.
        const nsfw = (message.channel.type == 'text') ? (message.channel.nsfw && !['sfw','safe'].includes(args[0])) : ((message.channel.type == 'dm') && ['lewd','nsfw','hental'].includes(args[0]));
        const engine = nsfw ? 'danbooru' : 'safebooru';
        const embed = new Discord.MessageEmbed()
        .setColor('#f98ed1')
        .setFooter('Image from: '+engine)
        await Booru.search(engine, ['ribbon_bondage'], { limit: 1, random: true })
        .then(img => message.reply({ embeds: [embed.setImage(img[0].fileUrl).setTimestamp()}))
        .catch( function(error) {message.reply('Unable to fetch an image. Try again in a few minutes.');}); // Replies to the user with a random image
    },
};
