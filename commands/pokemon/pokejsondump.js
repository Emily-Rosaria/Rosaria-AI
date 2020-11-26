const fetch = require('node-fetch'); // This lets me get stuff from api.
const { pokemon } = require('./../../config.json'); // Pokemon config
const fs = require('fs'); // files
const util = require('util') //for json

module.exports = {
  name: 'pokejsondump', // The name of the command
  description: 'Dumps the pokemon data json.', // The description of the command (for help text)
  perms: 'dev', //restricts to bot dev only (me)
  database: false,
  aliases: ['pokedump'],
  async execute(message, args) {
    message.reply("Not in use.");
    //let common = ["Caterpie","Weedle","Pidgey","Rattata","Spearow","Ekans","Sandshrew","NidoranF","NidoranM","Zubat","Oddish","Paras","Venonat","Diglett","Meowth","Psyduck","Mankey","Poliwag","Machop","Bellsprout","Tentacool","Geodude","Slowpoke","Magnemite","Doduo","Seel","Grimer","Shellder","Gastly","Krabby","Exeggcute","Koffing","Horsea","Goldeen","Staryu","Magikarp","Sentret","Hoothoot","Ledyba","Spinarak","Chinchou","Natu","Mareep","Marill","Hoppip","Sunkern","Wooper","Murkrow","Pineco","Snubbull","Teddiursa","Slugma","Swinub","Remoraid","Phanpy","Poochyena","Zigzagoon","Wurmple","Lotad","Seedot","Taillow","Wingull","Surskit","Shroomish","Slakoth","Nincada","Whismur","Makuhita","Skitty","Gulpin","Carvanha","Numel","Spoink","Trapinch","Cacnea","Barboach","Corphish","Feebas","Spheal","Starly","Bidoof","Kricketot","Shinx","Budew","Burmy","Combee","Buizel","Cherubi","Shellos","Buneary","Glameow","Stunky","Bronzor","Hippopotas","Skorupi","Finneon","Patrat","Lillipup","Purrloin","Munna","Pidove","Blitzle","Roggenrola","Woobat","Drilbur","Timburr","Tympole","Sewaddle","Venipede","Cottonee","Petilil","Sandile","Dwebble","Scraggy","Yamask","Trubbish","Ducklett","Vanillite","Deerling","Karrablast","Foongus","Frillish","Joltik","Ferroseed","Klink","Tynamo","Litwick","Cubchoo","Shelmet","Rufflett","Vullaby","Bunnelby","Fletchling","Scatterbug","Litleo","Flabébé","Honedge","Pikipek","Yungoos","Grubbin","Cutiefly","Mudbray","Dewpider","Fomantis","Bounsweet"];
    /*
    for (var i = 0; i < pokejson.length; i++) {
      if ((i+1) % 25 == 0) {console.log("Currently on Pokemon #"+(i+1))}
      const results2 = await fetch('https://pokeapi.co/api/v2/pokemon/'+(i+1)).then(response => response.json());
      let temp = pokejson[i];
      temp.types = results2.types.map(t=>t.type.name);
      temp.abilities = results2.abilities.map(a=>{
        let temp = {}; 
        temp.name = a.ability.name; 
        temp.hidden = a.is_hidden; 
        return temp;
      });
      temp.height = results2.height/10;
      temp.weight = results2.weight/10;
      let statsTemp = {};
      results2.stats.forEach(s=>statsTemp[s.stat.name]=s.base_stat);
      temp.stats = statsTemp;
      pokejson[i] = temp;
      if ((i+1) % 25 == 0) {console.log(pokejson[i])}
    }*/
    //message.reply("This command is no longer in use.");
    /*
    let { results } = await fetch('https://pokeapi.co/api/v2/pokemon?limit=' + pokemon.count).then(response => response.json());
    let pokejson = results.map((poke, index) => {
      let temp = {};
      temp.name = poke.name;
      temp.id = (index+1);
      temp.img = "other/official-artwork/"+(index+1)+".png";
      let temp2 = {};
      temp2.normal = (index+1)+".png";
      temp2.shiny = "shiny/"+(index+1)+".png"
      temp.sprites = temp2;
      return temp;
    });
    console.log("Done basics."); */ /*
    let eggArray = [];
    for (var i = 0; i < pokemon.count; i++) {
      if ((i+1) % 25 == 0) {console.log("Currently on Pokemon #"+(i+1))}
      const {name, id, evolves_from_species } = await fetch('https://pokeapi.co/api/v2/pokemon-species/'+(i+1)).then(response => response.json());
      if (evolves_from_species === null) {
        let temp = {};
        temp.id = id;
        temp.name = name;
        eggArray.push(temp);
      }
    }
    // const vars = ['name','id','img','normal','shiny','sprites','abilities','ability','types','type','height','weight','hidden','stats','hp','attack','defense','special-attack','special-defense','speed'];
    const vars = ["id","name"]
    console.log('Formatting and filtering...');
    let finalJSON = util.inspect(eggArray, {maxArrayLength: Infinity, showHidden: true, depth: null, maxStringLength: Infinity}).replace(/'/g,'"').replace(/\[length\]: \d+ *//*g,"").replace(/\n+/,"\n");
    for (s of vars) {finalJSON = finalJSON.replace(s+':','"'+s+'":')}
    console.log(finalJSON);
    console.log('Writing to file...');
    fs.writeFile('eggarray.json', finalJSON, (err)=>console.error(err));
    console.log('Done!'); */
  },
};