const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var TransactionsSchema = new Schema({
  user: {type: String, required: true}, // ID of user affected
  otherUsers: {type: [String], default: []}, // IDs of any other users involved
  time: {type: Number, default: (new Date()).getTime(), required: true}, // time of transaction
  type: {type: String, required: true}, // type of transaction (e.g. pokemon trade, item trade, token gift, etc.)
  details: {type: String, required: true} // autogenerated details of transaction 
});

// Model
var Transactions = mongoose.model("Transactions", TransactionsSchema); // Create collection model from schema
module.exports = Transactions; // export model
