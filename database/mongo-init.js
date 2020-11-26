//Library
const mongoose = require("mongoose");

// Database connection
const connectDB = require("./connectDB.js");
var database = "rose"; // Database name

// Models
//const Trainer = require("./models/trainers.js");

// Connect to database
connectDB("mongodb://localhost:27017/"+database);

const oldguilddata = require("./olddata.json");



mongoose.disconnect();
