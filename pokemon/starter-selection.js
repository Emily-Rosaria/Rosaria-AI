const Discord = require('discord.js'); // Image embed
const Trainers = require('./../database/models/trainers.js');
const Pokedex = require('./../database/models/pokedex.js');

module.export = async function (msg, user) {
  const starters = [1,4,7,152,155,158,252,255,258,387,390,393];
  const starterPokemonArray = await Pokedex.find({ _id: { $in: starters }}).exec().sort((p1,p2)=>p1.id-p2.id);

  const filter = (r, u) => {u.id == user.id && [].includes(r.emoji.name)}

  const baseEmbed = new Discord.MessageEmbed()
    .setColor('#ffcb05')
    .setTitle(title)
    .setDescription(desc)
    .setTimestamp()
    .setFooter('Use `r!starter <pokemon-ID/Name>` to choose your partner!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');

  for (const i in starterPokemonArray) {
    const s = starterPokemonArray[i];
    const gen = (i % 3) + 1;
    const cleanName = s.name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
    const line = cleanName + " is a "+pokemonTypes.join('/')+" type Pokémon.";
    baseEmbed.addField("Gen "+gen+": #"+s.id+" "+cleanName,line,true);
  }

  baseEmbed.addField("Viewing the Pokémon","React with a...\n1️⃣ ... for Gen 1\n2️⃣ ... for Gen 2\n3️⃣ ... for Gen 3\n4️⃣ ... for Gen 4",false);

  msg.channel.send("This command is work-in-progres...");
  /*
  await msg.edit({content: msg.content, embed: baseEmbed})
  .then(()=>msg.react('⬅️'))
  .then(()=>msg.react('➡️'));

  const filter = (r, u) => {u.id == user.id && ['⬅️','➡️','',''].includes(r.emoji.name)}
  const collector = msg.createReactionCollector(filter, { time: 300000 });

  collector.on('collect', (r, u) => {
    */
};
