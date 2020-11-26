const Canvas = require('canvas'); // Drawings
const Discord = require('discord.js'); // Image embed
const fetch = require('node-fetch'); // This lets me get stuff from api.
const { pokemon } = require('../config.json'); // Pokemon config

module.exports = {
  name: 'pokemon', // The name of the interval
  description: 'Who\'s that Pokémon?', // The description of the interval (for help text)
  delayChaos: 15*60, //variation
  async execute(channel) {
    let initT = (jsonT) => {let temp = jsonT; temp.pokecatch = 1; return temp;};
    let initP = (jsonP,key) => {let temp = jsonP; temp[key] = {"normal": 0, "shiny": 0}; return jsonP};
    const allIDs = Array.from({length: pokemon.count}, (_, i) => (i + 1));
    const notLegendaryIDs = allIDs.filter((a) => !pokemon.legends.includes(a));
    const roll1 = Math.ceil(Math.random() * pokemon.count);
    const roll2 = Math.ceil(Math.random() * pokemon.count);
    let finalRoll = roll1;
    if (!(roll1 == roll2)) {
      finalRoll = notLegendaryIDs[Math.floor(Math.random()*notLegendaryIDs.length)];
    }
    const pokemonID = finalRoll.toString();
    const { name, sprites } = await fetch('https://pokeapi.co/api/v2/pokemon/' + pokemonID).then(response => response.json());
    var pokemonName = name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-');
    console.log(pokemonName+" just spawned on "+channel.guild.name+".");
    const pokemonURL = sprites.other["official-artwork"].front_default;
    const canvas = Canvas.createCanvas(960, 540);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./bot_assets/mystery-pokemon.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    const mysteryIMG = Canvas.createCanvas(960, 540);
    const ctx2 = mysteryIMG.getContext('2d');
    const pokemonIMG = await Canvas.loadImage(pokemonURL);
    ctx2.drawImage(pokemonIMG, 20, 20);
    ctx2.globalCompositeOperation = 'source-in';
    ctx2.fillRect(0, 0, 960, 540);
    ctx.drawImage(mysteryIMG, 0, 0);
    const attachment1 = new Discord.MessageAttachment(canvas.toBuffer(), 'mystery-pokemon-encounter.png');
    ctx.drawImage(pokemonIMG, 20, 20);
    const attachment2 = new Discord.MessageAttachment(canvas.toBuffer(), 'wild-' + pokemonName + '.png');
    const embed1 = new Discord.MessageEmbed()
      .setColor('#FF0000')
      .setDescription("Who\'s that Pokémon? Say its name to throw a pokeball and catch it!")
      .setImage('attachment://mystery-pokemon-encounter.png')
      .setTimestamp()
      .setTitle('A wild Pokémon appears...')
      .setFooter('Hurry up before it gets away!', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
    const embed2 = new Discord.MessageEmbed()
      .setColor('#FF0000')
      .setImage('attachment://wild-' + pokemonName + '.png');
    channel.send({files: [attachment1], embed: embed1})
    .then( () => {
      const filter = async (m) => {
        if (!(m.content.toLowerCase().replace(/ /gi, '-').replace(/\./gi, '').startsWith(pokemonName.toLowerCase()))) { return false; }
        const now = new Date();
        const cooldown = pokemon.cooldown * 60 * 1000;
        var jsonTimers = await db.get("timers_" + m.author.id).then((timer) => !JSON.parse(timer).pokecatch ? init(JSON.parse(timer)) : JSON.parse(timer)).catch(() => { pokecatch: 1 }) || { pokecatch: 1 };
        const timeDiff = now.getTime() - jsonTimers.pokecatch;
        if (!(timeDiff < cooldown)) { return true; }
        const dateDiff = new Date(cooldown-timeDiff);
        const units = ['minute','second'];
        const timePhrase = dateDiff.toISOString().split('T')[1].split(':').slice(1).map(unit => Number(unit.match(/\d+/g)[0])).map((val,index) => {
          if (val == 0 && index == 0) {
            return null;
          } else if (val == 1) {
            return (val.toString() + ' ' + units[index])
          } else {
            return (val.toString() + ' ' + units[index] + 's')
          }
        }).filter((unit)=>unit!=null).join(' and ');
        m.reply('Don\'t wear yourself out. You can only catch one Pokémon per '+pokemon.cooldown.toString()+' minutes! You\'ve got about `' + timePhrase + '` left until you can catch again.');
        return false;
      }
      channel.awaitMessages(filter, { max: 1, time: 20*60*1000, errors: ['time'] })
      .then( async (collected) => {
        try {
          const winner = collected.first().author;
          const shiny = (Math.random()+pokemon.shinyOdds > 1);
          embed2.setDescription('<@' + winner.id + '> caught a ' + pokemonName + '!').setTimestamp().setTitle('Pokémon Caught!').setAuthor(winner.username, winner.displayAvatarURL()).setFooter('Use `r!dex` to see all the Pokémon you\'ve discovered.','https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
          const pokeKey = pokemonID + '_' + pokemonName;
          var timerJSON = await db.get("timers_"+winner.id).then((timer) => !JSON.parse(timer).pokecatch ? init(JSON.parse(timer)) : JSON.parse(timer)).catch(()=>{daily: 1}) || {daily: 1};
          var pokeJSON = await db.get("poke_" + winner.id).then((pokeStuff)=> !JSON.parse(pokeStuff)[pokeKey] ? initP(JSON.parse(pokeStuff),pokeKey) : JSON.parse(pokeStuff)).catch(()=>{initP({},pokeKey)}) || initP({},pokeKey);
          currentTime = new Date();
          timerJSON.pokecatch = currentTime.getTime();
          if (shiny) {
            pokeJSON[pokeKey].shiny += 1;
          } else {
            pokeJSON[pokeKey].normal += 1;
          }
          channel.send({files: [attachment2], embed: embed2});
          if (shiny) {
            channel.send('Something looks a little different about this Pokémon... ✨\n`This Pokémon is shiny. Currently, the sprites are work-in-progess, but you can still feel cool about it!`')
          }
          await db.set("poke_" + winner.id, JSON.stringify(pokeJSON));
          await db.set("timers_" + winner.id, JSON.stringify(timerJSON));
          if (!shiny) { console.log(winner.username+" caught a "+pokemonName+ " on "+channel.guild.name) } else { console.log(winner.username+" caught a SHINY "+pokemonName+ " on "+channel.guild.name) }
          let initB = (tempJ,k) => {let temp = tempJ; temp[k] = {caught: 0, escaped: 0}; return temp;}
          var botJSON = await db.get("poke_bot").then((pokeStuff)=>!JSON.parse(pokeStuff)[pokeKey] ? initB(JSON.parse(pokeStuff),pokeKey) : JSON.parse(pokeStuff)).catch(()=>initB({},pokeKey));
          if (JSON.stringify(botJSON) === '{}' || botJSON === null || botJSON === undefined) {
            botJSON = initB(botJSON,pokeKey);
          }
          botJSON[pokeKey].caught += 1;
          await db.set("poke_bot", JSON.stringify(botJSON));
        } catch (err) {throw err}
      })
      .catch( async (collected) => {
        embed2.setDescription('Oh no... the wild Pokémon excaped before anyone could catch it... It was a ' + pokemonName + '.').setTimestamp().setTitle('Wild '+pokemonName+' Fled').setFooter('Better luck next time...','https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
        channel.send({files: [attachment2], embed: embed2});
        console.log(pokemonName+" fled from " +channel.guild.name+ " before it could be caught...");
        let initB = (tempJ,k) => {let temp = tempJ; temp[k] = {caught: 0, escaped: 0}; return temp;}
        const pokeKey = pokemonID + '_' + pokemonName;
        var botJSON = await db.get("poke_bot").then((pokeStuff)=>!JSON.parse(pokeStuff)[pokeKey] ? initB(JSON.parse(pokeStuff),pokeKey) : JSON.parse(pokeStuff)).catch(()=>initB({},pokeKey));
        if (JSON.stringify(botJSON) === '{}' || botJSON === null || botJSON === undefined) {
          botJSON = initB(botJSON,pokeKey);
        }
        botJSON[pokeKey].escaped += 1;
        await db.set("poke_bot", JSON.stringify(botJSON));
      });
    })
    .catch( () => {console.log("Pokémon broke fix pls")})
  },
};
