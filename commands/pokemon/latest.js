const Trainers = require('./../../database/models/trainers.js');
const Discord = require('discord.js'); // Image embed
const Pokedex = require('./../../database/models/pokedex.js');

module.exports = {
  name: 'latest', // The name of the command
  description: 'Shows you your Pokédex.', // The description of the command (for help text)
  perms: 'basic',
  allowDM: true,
  aliases: ['latestcatch','latestpokemon','latestpoke','latestpokes'],
  args: false, // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    var user = message.author;
    var trainer = await Trainers.findById(user.id).exec();
    if (!trainer || !trainer.pokemon || trainer.pokemon.length == 1) {
      return message.reply("You've yet to catch any Pokémon. If you want to get started, use the `r!starter` command.");
    }
    const nick = trainer.nickname || user.username;
    var latestPokemon = trainer.pokemon.sort((a,b)=>b.captureDate - a.captureDate);
    const now = (new Date()).getTime();
    const toDuration = require('./../../misc_functions/toDuration.js');
    const imgPath = "./../../";
    if (latestPokemon.length > 25) {latestPokemon = latestPokemon.slice(0,25)}
    const dexData = await Pokedex.find({ _id: { $in: latestPokemon.map(p=>p.id) }}).exec()
    const pokemonArray = latestPokemon.map((p,i) => {
      const dex = dexData.find(d=>d._id==p.id);
      let temp = {};
      temp.name = p.name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
      temp.nickname = p.nickname;
      temp.id = p.id.toString();
      temp.legend = p.legend;
      temp.shiny = p.shiny;
      temp.description = dex.description;
      temp.gender = p.gender;
      temp.img = p.shiny ? imgPath + dex.imgs.shiny : imgPath + dex.imgs.normal;
      temp.types = dex.types.map(t=>t[0].toUpperCase()+t.slice(1)).join('/');
      temp.duration = toDuration(now - p.captureDate, 3);
      temp.date = new Date(p.captureDate);
      return temp;
    })
    const pages = pokemonArray.length;
    let page = 0;
    const getEmbed = (pg) => {
      const poke = pokemonArray[pg];
      const shinyTest = poke.shiny ? "✨" : "";
      const legendTest = poke.legend ? " They are a legendary Pokémon!" : "";
      const desc = `<@${user.id}> caught ${poke.nickname}${shinyTest} about \`${poke.duration}\` ago. ${poke.nickname}${shinyTest} is ${poke.gender}, and is a ${poke.types} type Pokémon.${legendTest}`;
      const nameString = (poke.name == poke.nickname) ? (shinyTest + poke.name) : `${shinyTest}${poke.name} (AKA: ${shinyTest}${poke.nickname})`
      const embed = new Discord.MessageEmbed()
        .setColor('#ff5959')
        .setTitle(nick+"'s "+nameString+shinyTest)
        .setDescription(desc)
        .addField("Pokédex Data",poke.description)
        .setImage(poke.img)
        .setTimestamp(poke.date)
        .setFooter(`Latest Pokémon of ${nick} -- ${pg+1} / ${pages}`, user.displayAvatarURL());
      return embed;
    }

    var embed = getEmbed(page);
    var msg = await message.channel.send(embed);
    await msg.react('⬅️').then(()=>msg.react('➡️')).catch(()=>message.reply("Failed to post latest pokemon. Do I have permission to use reacts and post embeds in this channel?"));

    let cooldown = 0;

    const filter = (r, u) => {
      if (!(['⬅️', '➡️'].includes(r.emoji.name) && u.id === user.id)) {return false}
      if (cooldown + 400 > (new Date()).getTime()) {return false}
      cooldown = (new Date()).getTime();
      return true;
    };

    const collector = msg.createReactionCollector(filter, { idle: 300000, dispose: true });

    const right = async (pg) => {
      let newPage =  (((pg+1) % pages ) + pages ) % pages;
      embed = getEmbed(newPage);
      msg.edit(embed);
      return newPage;
    }

    const left = async (pg) => {
      let newPage =  (((pg-1) % pages ) + pages ) % pages;
      embed = getEmbed(newPage);
      msg.edit(embed);
      return newPage;
    }

    collector.on('collect', async (r, u) => {
      if (['⬅️'].includes(r.emoji.name)) {page = await left(page)}
      if (['➡️'].includes(r.emoji.name)) {page = await right(page)}
    });

    collector.on('remove', async (r) => {
        if (['⬅️'].includes(r.emoji.name)) {page = await left(page)}
        if (['➡️'].includes(r.emoji.name)) {page = await right(page)}
    });
  },
};
