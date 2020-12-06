//Library
const mongoose = require("mongoose");

// Database connection
const connectDB = require("./connectDB.js");
var database = "rose"; // Database name

// Connect to database
connectDB("mongodb://localhost:27017/"+database);

// Models
const Pokemon = require("./models/pokedex.js");
//const Trainers = require("./models/trainers.js");

//db reset
//Trainers.db.dropDatabase(function(err, result) {console.log("Resetting trainer database...")});

const PokedexData = require("./../bot_assets/pokedex.json");

const PokeDescs = require("./../bot_assets/poke-info.json");

const starters = [1,2,3,4,5,6,7,8,9,152,153,154,155,156,157,158,159,160,252,253,254,255,256,257,258,259,260,387,388,389,390,391,392,393,394,395];

const eggPokemon = [1,4,7,10,13,16,19,21,23,27,29,32,37,41,43,46,48,50,52,54,56,58,60,63,66,69,72,74,77,79,81,83,84,86,88,90,92,95,96,98,100,102,104,108,109,111,114,115,116,118,120,123,127,128,129,131,132,133,137,138,140,142,152,155,158,161,163,165,167,170,172,173,174,175,177,179,187,190,191,193,194,198,200,203,204,206,207,209,211,213,214,215,216,218,220,222,223,225,227,228,231,234,235,236,238,239,240,241,246,252,255,258,261,263,265,270,273,276,278,280,283,285,287,290,293,296,298,299,300,302,303,304,307,309,311,312,313,314,316,318,320,322,324,325,327,328,331,333,335,336,337,338,339,341,343,345,347,349,351,352,353,355,357,359,360,361,363,366,369,370,371,374,387,390,393,396,399,401,403,406,408,410,412,415,417,418,420,422,425,427,431,433,434,436,438,439,440,441,442,443,446,447,449,451,453,455,456,458,459,479,489];

const genderlessArray = [81,82,100,101,120,121,137,144,145,146,150,151,201,233,243,244,245,249,250,251,292,337,338,343,344,374,375,376,377,378,379,382,383,384,385,386,436,437,462,474,479,480,481,482,483,484,486,487,489,490,491,492,493];

const maleOnly = [106,107,128,236,237,313,32,33,34,381,414,475];

const femaleOnly = [113,115,124,238,241,242,29,30,31,314,380,413,416,440,478,549];

const NewPokeData = PokedexData.map((poke, i)=>{
  let rareNum = 1;
  if (starters.includes(poke.id)) {rareNum = 2}
  if (poke.legend) {rareNum = 75}
  const isEgg = eggPokemon.includes(poke.id);
  let genderOdds = 0.5;
  if (genderlessArray.includes(poke.id)) {
    genderOdds = -1;
  } else if (maleOnly.includes(poke.id)) {
    genderOdds = 0;
  } else if (femaleOnly.includes(poke.id)) {
    genderOdds = 1;
  }
  let temp = {};
  temp._id = poke.id;
  temp.name = poke.name;
  temp.imgs = {normal: `poke-imgs/normal/${poke.id}.png`, shiny: `poke-imgs/shiny/${poke.id}.png`};
  temp.sprites = {normal: `poke-sprites/normal/${poke.id}.png`, shiny: `poke-sprites/shiny/${poke.id}.png`};;
  temp.types = poke.types;
  temp.abilities = poke.abilities;
  temp.height = poke.height;
  temp.weight = poke.weight;
  temp.stats = poke.stats;
  temp.rarity = rareNum;
  temp.legend = poke.legend;
  temp.egg = isEgg;
  temp.gender = genderOdds;
  temp.description = PokeDescs[i];
  return temp;
});

const x = async () => {
  const options = {new: true, upsert: true, setDefaultsOnInsert: true, overwrite: true};
  await NewPokeData.forEach(async (poke) => {
    await Pokemon.findByIdAndUpdate(poke._id, poke, options).exec();
  });
};

x().then(async ()=>{
  console.log("Done, now sending random pokemon to your location!");
  console.log(await Pokemon.randomWild());
  mongoose.disconnect();
}).catch((err)=>{
  console.error(err);
  mongoose.disconnect();
});
