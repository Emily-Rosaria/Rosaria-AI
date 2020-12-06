//Library
const mongoose = require("mongoose");

// Database connection
const connectDB = require("./connectDB.js");
var database = "rose"; // Database name
connectDB("mongodb://localhost:27017/"+database);

const Pokemon = require("./models/pokedex.js");

let x = async () => {
  console.log(await Pokemon.randomWild());
  mongoose.disconnect();
}
x();
