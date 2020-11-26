const GuildData = require(".database/models/guilds.js");

module.exports = async function (client) {

    client.spawnloops = new Discord.Collection(); // Creates list for running pokemon spawners
    const pokemonspawner = require('./pokemon.js'); // collects the intervals
    channelData = await GuildData.find({}).then((data) => {
        data.filter(el => el.pokemonspawns).map((el) => {
            let temp = {};
            temp.channel = data.pokemonspawns;
            temp.last = data.lastspawn || 1;
            return temp;
        });
    });
    for (const c of channelData) {
        console.log('Setting up '+interval.name+c.channel+'.');
        const ic = client.channels.cache.get(c.channel); .channel
        let loop = (pokemonspawner,ic) => {
            if ((pokemonspawner.delay*1000+c.lastspawn) < new Date().getTime()) {pokemonspawner.execute(ic)}
            const nextDelay = (pokemonspawner.delay*1000) + Math.ceil(Math.random()*pokemonspawner.delayChaos*1000);
            const timeout = client.setTimeout(loop,nextDelay,pokemonspawner,ic);
            client.spawnloops.set(pokemonspawner.name+c.channel,timeout);
        };
    };
}
