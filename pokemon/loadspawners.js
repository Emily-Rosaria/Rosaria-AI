const GuildData = require("./../database/models/guilds.js");
const Discord = require('discord.js');

module.exports = async function (client) {

    client.spawnloops = new Discord.Collection(); // Creates list for running pokemon spawners
    const pokemonspawner = require('./pokemon.js'); // collects the intervals
    let channelData = await GuildData.find({}).exec();
    channelData = channelData.filter(el => el.pokeData.spawnChannel != "").map((el) => {
        let temp = {};
        temp.channel = el.pokeData.spawnChannel;
        temp.last = el.pokeData.lastSpawn;
        return temp;
    });
    const minDelay = client.pokeConfig.get("minDelay");
    const randomDelay = client.pokeConfig.get("randomDelay");
    for (const c of channelData) {
        const ic = client.channels.cache.get(c.channel);
        if (ic) {
            console.log('Setting up '+pokemonspawner.name+c.channel+' at '+ic.guild.name+'.');
            let loop = (pokemonspawner,ic) => {
                pokemonspawner.execute(ic);
                const nextDelay = minDelay + Math.floor(Math.random()*randomDelay);
                const timeout = client.setTimeout(loop,nextDelay,pokemonspawner,ic,client,c,minDelay,randomDelay);
                client.spawnloops.set(pokemonspawner.name+ic.id,timeout);
                client.spawnloops.array();
            };
            loop(pokemonspawner,ic);
        } else {
            console.log("Could not reach channel: "+c.channel+".");
        }
    };
}
