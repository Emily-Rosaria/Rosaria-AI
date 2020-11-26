//Library
const mongoose = require("mongoose");

// Database connection
const connectDB = require("./connectDB.js");
var database = "rose"; // Database name


// Connect to database
connectDB("mongodb://localhost:27017/"+database);

// Models
const Trainers = require("./models/trainers.js");

const Guilds = require("./models/guilds.js");

x = async () => {
  await Trainers.find({}, (err, users)=>{ //find and return all documents inside collection
      if(err) {console.error(err)} // error handling
      console.log(users);
  });
  await Guilds.find({}, (err, guilds)=>{ //find and return all documents inside collection
      if(err) {console.error(err)} // error handling
      console.log(guilds);
      let gX = [];
      let gP = [];
      for (const g of guilds) {
        if (g.perms.allowAll === false) {
          gX.push(g);
          gP.push(g.perms);
        }
      }
      console.log(gX);
      console.log(gP);
  });
  mongoose.disconnect();
}
x();
