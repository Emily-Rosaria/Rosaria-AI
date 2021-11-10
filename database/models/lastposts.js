const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Create Schema
var LastpostSchema = new Schema({
    _id: {type: String, required: true}, // ID of channel on Discord
    messageID: {type: String, required: true}, // ID of message on Discord
    userID: {type: String, required: true}, // ID of channel on Discord
    timestamp: {type: Number, required: true},
    length: {type: Number, required: true} // character count of the post
});

LastpostSchema.virtual('channelID').get(function() {
  return this._id;
})

// Model
var Lastposts = mongoose.model("lastposts", LastpostSchema); // Create collection model from schema
module.exports = Lastposts; // export model
