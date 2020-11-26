const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var SpriteSchema = new Schema({
  normal: String, // e.g. X.png
  shiny: String // e.g. shiny/X.png
});

var AbilitySchema = new Schema({
  name: String, // Ability name
  hidden: Boolean // if the ability is hidden, or whatevs. usually false
});

var StatsSchema = new Schema({
  hp: Number,
  attack: Number,
  defense: Number,
  specialAttack: Number,
  specialDefense: Number,
  speed: Number
});

//base pokemon img path = https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/

var WildPokemonSchema = new Schema({
    _id: Number, //pokedex Number
    name: String, // species name
    img: String, // e.g.  other/official-artwork/X.png
    sprites: SpriteSchema,
    types: [String], // e.g. ["grass","fighting"]
    abilities: [AbilitySchema],// ability list
    height: Number, // height in metres
    weight: Number, // weight in kg
    stats: StatsSchema, // base stats
    rarity: Number, // same as 100/weighting
    legend: Boolean, // if the pokemon is "legendary"
    egg: Boolean, // if the pokemon can be obtained from an egg (such as in a daily)
    gender: Number // will be -1 for genderless, 1 for all female, 0 for all male, 0.5 for even spread
});

WildPokemonSchema.virtual('id').get(function() {
  return this._id;
});

WildPokemonSchema.statics.randomWild = async function (allowLegends) {
  let acc = 0;
  const query = (typeof allowLegends !== 'undefined' || allowLegends) ? {} : {legend: false};
  chances = await this.find(query).then((data) =>
    data.map((el) => {
      let temp = {};
      acc = (100/el.rarity) + acc;
      temp.chance = acc;
      temp.id = el.id;
      return temp;
    })
  );
  const sum = chances.slice(-1)[0].chance;
  const rand = Math.random() * sum;
  const id = chances.find(el => el.chance > rand).id;
  return await this.findById(id).exec();
}

WildPokemonSchema.statics.randomWilds = async function (number, allowLegends) {
  let loops = !number || isNaN(number) ? 1 : number;
  const query = (typeof allowLegends !== 'undefined' || allowLegends) ? {} : {legend: false};
  if (loops < 1) {loops = 1}
  else if (loops > 10) {loops = 10}
  let acc = 0;
  chances = await this.find({}).then((data) =>
    data.map((el) => {
      let temp = {};
      acc = (100/el.rarity) + acc;
      temp.chance = acc;
      temp.id = el.id;
      return temp;
    })
  );
  const sum = chances.slice(-1)[0].chance;
  let array = [];
  for (var i = 0; i < loops; i++) {
    const rand = Math.random() * sum;
    const id = chances.find(el => el.chance > rand).id;
    const newPoke = await this.findById(id).exec();
    array.push(newPoke);
  }
  return array;
}

WildPokemonSchema.statics.randomEgg = async function () {
  let acc = 0;
  chances = await this.find({ egg: true }).then((data) =>
    data.map((el) => {
      let temp = {};
      acc = (100/el.rarity) + acc;
      temp.chance = acc;
      temp.id = el.id;
      return temp;
    })
  );
  const sum = chances.slice(-1)[0].chance;
  const rand = Math.random() * sum;
  const id = chances.find(el => el.chance > rand).id;
  return this.find( { id: id });
}

WildPokemonSchema.statics.randomDaily = async function (trainer) {
  const pokeCount = await this.countDocuments({});
  const allPokemon = trainer.unique >= pokeCount;
  if (pokeCount < trainer.unique) {console.log("ERROR: Check the commands. `pokeCount count < user's unique count`.")};
  if (allPokemon) {
    const dailyPokemonArray = randomWilds(5, legendary);
    const rare = dailyPokemonArray.filter(p=>p.legend);
    if (rare.length>0) {return {dailyPokemon: rare[0], unique: false, tier: 3}}
  }
  const legendIDs = await this.find({ legendary: true }).then((data) => data.id);
  const caughtLegends = trainer.legends;
  const legendary = caughtLegends.length > 0 ? legends.reduce((acc,cur)=>acc && caughtLegends.includes(cur),true) : false;
  const tierVal = legendary ? 2 : 1;
  const dailyPokemonArray = randomWilds(3, legendary);
  const newPokes = dailyPokemonArray.filter(p => !trainer.pokemon.includes(p.id));
  if (newPokes.length > 0) {return {dailyPokemon: newPokes[0], unique: true, tier: tierVal}}
  else {return {dailyPokemon: dailyPokemonArray[0], unique: true, tier: tierVal}}
}

WildPokemonSchema.statics.nameOf = async function (id) {
  let temp = await this.findById(Number(id)).exec();
  if (!temp) {
    return null;
  } else {
    return temp.name;
  }
}

WildPokemonSchema.statics.nameToID = async function (name) {
  let cleanName = name.replace(' ','-'),replace(/\./,'').toLowerCase();
  let temp = await this.findOne({ name: cleanName }).exec();
  if (!temp) {
    return null;
  } else {
    return temp.id;
  }
}

WildPokemonSchema.method('randomGender', function() {
  if (this.gender < 0) {return "genderless"}
  else if (Matt.random() < this.gender) {return "female"}
  else {return "male"}
});

var WildPokemon = mongoose.model("WildPokemon", WildPokemonSchema); // Create collection model from schema

module.exports = WildPokemon;
