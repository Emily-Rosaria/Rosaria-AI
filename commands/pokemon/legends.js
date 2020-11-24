const { pokemon } = require('./../../config.json'); // Pokemon config
const Discord = require('discord.js'); // Image embed


module.exports = {
  name: 'legends', // The name of the command
  description: 'Gets a list of users with legendary pokemon!', // The description of the command (for help text)
  args: false, // Specified that this command doesn't need any data other than the command
  perms: 'verified', //restricts to bot dev only (me)
  database: true,
  cooldown: 30,
  aliases: ['getlegends'],
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, db, args) {
    var data = await db.getAll();
    const keys = Object.keys(data);
    const arr = keys.map((key)=>[key,JSON.parse(data[key])]).filter((d)=>d[0].split('_')[0]=="poke");
    const legendKeepers = arr.map((dex)=>{
      const pokes = Object.keys(dex[1]).filter((k)=>{
        return pokemon.legends.includes(Number(k.split('_')[0]));
      });
      return [dex[0].split('_')[1],pokes];
    }).filter((a)=>a[1].length!=0);
    let msg = legendKeepers.length>0 ? "" : "Looks like no one has caught any legendary pokemon yet...";
    for (const keeper of legendKeepers) {
      let newLine = '<@' + keeper[0] + '> has captured:\n'
      for (const caught of keeper[1]) {
        const idName = caught.split('_');
        newLine = newLine + '> #' + idName[0] +' '+idName[1]+'\n';
      }
      if (msg.length+newLine.length <2020) {
        msg = msg + newLine;
      } else {
        break;
      }
    }
    const embed = new Discord.MessageEmbed()
    .setColor('#ff0000')
    .setTitle('The Legendary Crew')
    .setDescription(msg)
    .setTimestamp()
    .setFooter('Requested by '+message.author.username+'#'+message.author.discriminator,message.author.displayAvatarURL());
    message.channel.send(embed);
  },
};