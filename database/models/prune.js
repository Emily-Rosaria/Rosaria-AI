const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var PruneMessageSchema = new Schema({
  _id: {type: String, required: true}, // ID of the message that was posted
  author: {type: String, required: true}, // ID of the author that posted the message
  channel: {type: String, required: true}, // ID of the channel the message was posted in
  timestamp: {type: Number, required: true} // unix time in ms of message posted
});
/*
PruneMessageSchema.statics.prune = async function (days) {
  const now = new Date().getTime();
  const time = !days || isNaN(days) ? 14 : Number(days);
  const oneDay = 24*60*60*1000; // in ms
  const pastTimestamp = time < 14 ? now - 14*oneDay : (time > 90 ? now - 90*oneDay : now - pastTimestamp*oneDay);
  const delet = await this.deleteMany({quest: false, "$lte": {timestamp: pastTimestamp}}).exec();
  return delet;
}
*/
// Model
var messages = mongoose.model("prune", PruneMessageSchema); // Create collection model from schema
module.exports = messages; // export model
