//Library
const mongoose = require("mongoose");

// Database connection
const connectDB = require("./connectDB.js");
var database = "rose"; // Database name

// Models
const Trainer = require("./models/trainers.js");

// Connect to database
connectDB("mongodb://localhost:27017/"+database);

var insertedTrainer = new Trainer({ // Create new document
    id: 247344219809775617,
    nickname: "Emily Rose",
    tagline: "Gotta catch 'em all."
});

insertedTrainer.save(err => { // save document inside Users collection
    if(err) {throw err} // error handling
    console.log("Document inserted!");
    mongoose.disconnect() // disconnect connection from database once document is saved
});

const PokedexData = require("Pokedex.json");

const Pokemon = require("models/pokedex.js");

const readline = require('readline'); // for interface

for (poke of PokedexData) {
  const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
  });
  rl.question('Enter the rarity of #'+poke.id+' '+poke.name+': ', (rare) => {
    rl.close();
    var NewPokemon = new Pokemon({
      id: poke.id,
      name: poke.name,
      img: poke.img,
      sprites: poke.sprites,
      types: poke.types,
      abilities: poke.abilities,
      height: poke.height,
      weight: poke.weight,
      stats: poke.stats,
      rarity: rare,
      legend: poke.legend
    })
    connectDB("mongodb://localhost:27017/"+database);

    NewPokemon.save(err => { // save document inside Users collection
        if(err) {throw err} // error handling
        console.log("#"+poke.id+" "+poke.name+" added with a rarity of "+rare);
        mongoose.disconnect() // disconnect connection from database once document is saved
    });
  });
}
