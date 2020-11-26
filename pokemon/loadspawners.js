const GuildData = require("../database/models/guilds.js");

module.exports = async function (client) {

    client.spawnloops = new Discord.Collection(); // Creates list for running pokemon spawners
    const pokemonspawner = require('./pokemon.js'); // collects the intervals
    let channelData = await GuildData.find({}).exec();
    channelData = channelData.filter(el => el.pokemonspawns).map((el) => {
        let temp = {};
        temp.channel = data.pokemonspawns;
        temp.last = data.lastspawn || 1;
        return temp;
    });
    const minDelay = client.pokeConfig.get("minDelay");
    const randomDelay = client.pokeConfig.get("randomDelay");
    for (const c of channelData) {
        console.log('Setting up '+interval.name+c.channel+'.');
        const ic = client.channels.cache.get(c.channel);
        if (ic) {
            let loop = (pokemonspawner,ic) => {
                if ((minDelay+c.last) < new Date().getTime()) {pokemonspawner.execute(ic)}
                const nextDelay = minDelay + Math.floor(Math.random()*randomDelay);
                const timeout = client.setTimeout(loop,nextDelay,pokemonspawner,ic,c,minDelay,randomDelay);
                client.spawnloops.set(pokemonspawner.name+c.channel,timeout);
            };
        } else {
          console.log("Could not reach channel: "+c.channel);
        }
    };
}
