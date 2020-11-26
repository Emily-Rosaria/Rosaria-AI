//Library
const mongoose = require("mongoose");
// Database connection
const connectDB = require("./connectDB.js");
var database = "rose"; // Database name
connectDB("mongodb://localhost:27017/"+database);
// Models
//const Trainer = require("./models/trainers.js");

//get data
const oldguilddata = require("./olddata.json");

const Guilds = require("./models/guilds.js");
const options = {new: true, upsert: true, setDefaultsOnInsert: true}
const x = async () => {
  for (const guildData of oldguilddata) {
    const query = {id: guildData.id};
    let newGuild = await Guilds.findOneAndUpdate(query, guildData, options).exec();
    console.log(newGuild);
  }
  console.log("Done, guild configs should be updated!");
  mongoose.disconnect();
};

x();
