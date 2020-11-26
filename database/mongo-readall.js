//Library
const mongoose = require("mongoose")

// Database connection
const connectDB = require("./connectDB.js")
var database = "rose" // Database name


// Connect to database
connectDB("mongodb://localhost:27017/"+database)

// Models
const Trainers = require("./models/trainers.js")


/*
Trainers.find({}, (err, users)=>{ //find and return all documents inside Users collection
    if(err) throw err // error handling
    console.log(users)
    mongoose.disconnect()
});
*/
// Pokemon
const Pokemon = require("./models/pokedex.js")

// Connect to database

Pokemon.find({}, (err, pokes)=>{ //find and return all documents inside Users collection
    if(err) throw {err}; // error handling
    console.log(pokes);
    mongoose.disconnect();
});
