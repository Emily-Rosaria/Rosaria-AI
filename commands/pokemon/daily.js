const Canvas = require('canvas'); // Drawings
const Discord = require('discord.js'); // Image embed
const fetch = require('node-fetch'); // This lets me get stuff from api.
const { pokemon, perms } = require('./../../config.json'); // Pokemon config

module.exports = {
  name: 'daily', // The name of the command
  description: 'Gives you your daily bonus! Bonuses include:\n> A free Pokémon roll, with increased odds of rolling one you haven\'t caught before. Only generates legendaries if all other Pokémon have been obtained. Increased shiny chance for those with a full Pokédex.\nClaims reset at midnight UTC time.', // The description of the command (for help text)
  args: false, // Specified that this command doesn't need any data other than the command
  perms: 'verified', //only poeple I know
  cooldown: 15,
  database: true,
  aliases: ['dailybonus','daily-bonus','dailyclaim','daily-claim'],
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, db, args) {
    user = message.author;
    if (message.channel.type == 'dm') {message.reply('This command only works in servers.'); return;}
    if (!(message.member.roles.cache.find(r => r.id == perms['verified+']) || (message.guild.id == '749880737712308274'))) {message.reply('Please write an introduction over at <#729760752898146336> to gain access to this command.'); return;}
    let initT = (jsonT) => {let temp = jsonT; jsonT.daily = 1; return jsonT};
    var userTimers = await db.get("timers_" + user.id)
    .then( (timersString) => JSON.parse(timersString)).catch(()=>{daily: 1}) || {daily: 1};
    if (userTimers===null || userTimers===undefined) {
      userTimers = {};
    }
    if (userTimers.daily === null || userTimers.daily === undefined) {
      userTimers.daily = 1;
    }
    const now = new Date();
    const lastReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
    const lastClaim = new Date(userTimers.daily);
    if (lastReset.getTime() > lastClaim.getTime()) {
      userTimers.daily = now.getTime();
      var userPokemon = await db.get("poke_" + user.id)
      .then( (pokeString) => JSON.parse(pokeString)).catch(()=>{});
      const pokeList = (JSON.stringify(userPokemon)==='{}' || userPokemon === null || userPokemon === undefined) ? ['0'] : Object.keys(userPokemon).map( (p) => p.split('_') ).sort((a,b) => Number(a[0])-Number(b[0]));
      const pokeIDs = pokeList.map(e => e[0]);
      const allIDs = Array.from({length: pokemon.count}, (_, i) => (i + 1).toString());
      const notLegendaryIDs = allIDs.filter((a) => !pokemon.legends.includes(Number(a)));
      const legendary = notLegendaryIDs.reduce((acc, cur) => acc && pokeIDs.includes(cur));
      const all = (pokeIDs.length == pokemon.count);
      let getFinalID = (trys) => {
        if (all) {
          roll1 = Math.ceil(Math.random()*pokemon.count);
          roll2 = Math.ceil(Math.random()*pokemon.count);
          if (pokemon.legends.includes(roll1) && (roll1 == roll2)) {
            return roll1.toString();
          }
        }
        if (legendary) {
          const newIDs = [...Array(trys)].map(() => Math.ceil(Math.random()*pokemon.count)).filter((a) => all || !pokeIDs.includes(a.toString()));
          const repeat = Math.abs(newIDs.sort((a,b)=>(a-b)).reduce((acc, cur, index) => {if (acc == cur) {return -cur} else if (acc<0) {return acc} else if (index+1 != newIDs.length) {return cur} else {return 0}},0));
          if (repeat != 0) {return repeat}
          //checks if duplicate exists, then returns it by sorting newIDs, then looping through with reduce, setting accumulator to either the current value, it's negative (if acc is the new current value) or not changing it (if acc is negative). So it overall returns the negative of the duplicated value.
        } else {
          const newIDs = [...Array(trys)].map(() => notLegendaryIDs[Math.floor(Math.random()*notLegendaryIDs.length)]).filter((a) => !pokeIDs.includes(a.toString()));
          if (newIDs.length > 0) {
            return newIDs[0];
          }
        }
        return notLegendaryIDs[Math.floor(Math.random()*notLegendaryIDs.length)];
      }
      const finalID = getFinalID(3).toString();
      var shiny = Math.random()+pokemon.shinyOdds;
      if (legendary) {shiny = shiny+pokemon.shinyOdds}
      if (pokeIDs.length == pokemon.count) {
        shiny = shiny + pokemon.shinyOdds*2;
      }
      shiny = (shiny > 1); 
      const { name, sprites } = await fetch('https://pokeapi.co/api/v2/pokemon/' + finalID).then(response => response.json()).catch(function(error) {
          console.error(error);
          message.reply('Unable to fetch Pokémon, please try again later...');
          return;
        });
      const newPokemon = {
        name: name.split('-').map(word => (word[0].toUpperCase() + word.slice(1))).join('-'),
        id: finalID,
        shiny: shiny,
        img: sprites.other["official-artwork"].front_default
      }
      const unique = (!pokeIDs.includes(finalID));
      const legendaryCatch = (pokemon.legends.includes(Number(finalID)));
      const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Daily Roulette!')
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setDescription('Stay tuned while we fetch your daily bonus Pokémon! Your Pokémon will be sent to you shortly...')
        .setImage('https://cdn.dribbble.com/users/621155/screenshots/2835314/simple_pokeball.gif')
        .setTimestamp()
        .setFooter('Fetching Pokémon...', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
      await message.channel.send(embed).then( async (msg) => {
        setTimeout( async (message) => {
          await message.reply('Contacting the Pokémon Trading Centre...');
        }, 2500, message);
        setTimeout(async (message,unique) => {
          if (unique) {
            await message.reply('Get ready to update your Pokédex!');
          } else {
            await message.reply('We think you\'ll be familiar with this one!');
          }
        }, 5000, message, unique);
        setTimeout(async (message,legendaryCatch) => {
          if (legendaryCatch) {
            await message.reply('Boy is this one special! We didn\'t know they just gave these things away...');
          } else {
            await message.reply('We think you might have heard of it before!');
          }
        }, 7500, message,legendaryCatch);
        setTimeout(async (message, msg, newPokemon, db) => {
          let initP = (jsonP) => {let temp = jsonP; jsonP[key] = {"normal":0,"shiny":0}; return jsonP};
          const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Daily Pokémon: #'+newPokemon.id+' '+newPokemon.name+'!')
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setDescription('Wow, <@'+message.author.id+'> just recieved a '+newPokemon.name+' from the daily Pokémon roulette!')
            .setImage(newPokemon.img)
            .setTimestamp()
            .setFooter('Use `r!dex` to see all the Pokémon you\'ve discovered.', 'https://www.ssbwiki.com/images/7/7b/Pok%C3%A9_Ball_Origin.png');
          await msg.edit(embed);
          shinyText = newPokemon.shiny ? '\n... wait a second! Something looks a little different about this Pokémon... ✨\n`This Pokémon is shiny. Currently, the sprites are work-in-progess, but you can still feel cool about it!`' : '';
          await message.reply('Your Pokémon has arrived! We hope '+newPokemon.name+' has a good time in your care.'+shinyText);
          var freshTimers = await db.get("timers_" + message.author.id)
          .then( (timersString) => JSON.parse(timersString)).catch(()=>{}) || {};
          const newNow = new Date();
          freshTimers.daily = newNow.getTime();
          await db.set("timers_"+message.author.id,JSON.stringify(freshTimers));
          const pokeKey = newPokemon.id + '_' + newPokemon.name;
          var pokeJSON = await db.get("poke_" + message.author.id).then((pokeStuff)=> JSON.parse(pokeStuff)).catch(()=>{});
          if (pokeJSON === null || pokeJSON === undefined || JSON.stringify(pokeJSON) === '{}') {
            let temp = {};
            temp[pokeKey] = { "normal": 0, "shiny": 0 };
            pokeKey = temp;
          }
          if (!pokeJSON[pokeKey]) {pokeJSON[pokeKey] = { "normal": 0, "shiny": 0 }};
          if (newPokemon.shiny) {
          pokeJSON[pokeKey].shiny += 1;
          } else {
          pokeJSON[pokeKey].normal += 1;
          }
          if (!shiny) {
            console.log(message.author.username+" claimed a "+newPokemon.name+ " for their daily bonus at "+message.channel.guild.name)
          } else {
            console.log(message.author.username+" claimed a SHINY "+newPokemon.name+ " for their daily bonus at "+message.channel.guild.name)
          }
          //console.log(pokeJSON)
          await db.set("poke_" + message.author.id, JSON.stringify(pokeJSON));
        }, 10000, message, msg, newPokemon, db);
      }).catch ((err) => {console.error(err); message.reply('Something went wrong...')})
    } else {
      const timeDiff = new Date(nextReset.getTime() - now.getTime());
      const wait = timeDiff.toISOString().split('T')[1].split(':').map(unit => Number(unit.match(/\d+/g)[0]));
      const units = ['hour','minute','second'];
      const waitText = wait.map( (unit, index) => unit == 1 ? ' '+unit.toString() + ' ' + units[index]: (unit == 0 ? '' : ' '+unit.toString() + ' ' + units[index]+'s')).filter( (el) => (el != '')).map( (el,index,arr) => {if(index+1==arr.length && arr.length>1) {return (' and'+el);} else if (index==0) {return el.slice(1);} else {return el;}});
      message.reply('You can\'t claim for roughly `'+waitText.filter( (el) => (el != '')).join('')+'`.');
    }
  },
};