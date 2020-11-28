const Discord = require('discord.js'); // Image embed
const Trainers = require('./../database/models/trainers.js');
const Pokedex = require('./../database/models/pokedex.js');

module.exports = async function (msg, user) {
  const starters = [1,4,7,152,155,158,252,255,258,387,390,393];
  const starterPokemonArray = await Pokedex.find({ _id: { $in: starters }}).exec().then(p => p.sort((p1,p2)=>p1.id-p2.id));

  //const filter = (r, u) => {u.id == user.id && [].includes(r.emoji.name)}

  const baseEmbed = new Discord.MessageEmbed()
    .setColor('#ffcb05')
    .setAuthor(user.username, user.displayAvatarURL())
    .setTitle("Choose your Pokémon!")
    .setDescription("There are many Pokémon to choose from, so make sure you choose the one that's right for you!")
    .setTimestamp()
    .setFooter('Good luck on your journey!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');

  for (const i in starterPokemonArray) {
    const s = starterPokemonArray[i];
    const gen = Math.floor(i / 3) + 1;
    const cleanName = s.name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
    const line = cleanName + " is a "+s.types.join('/')+" type Pokémon.";
    baseEmbed.addField("Gen "+gen+": #"+s.id+" "+cleanName,line,true);
  }

  baseEmbed.addField("Viewing and Choosing your Pokémon","Use `r!dexsearch <ID/Name>` to view more info about each Pokémon!\nUse `r!starter <ID/Name> to choose your starter`",false);

  await msg.edit({content: msg.content, embed: baseEmbed});

};
