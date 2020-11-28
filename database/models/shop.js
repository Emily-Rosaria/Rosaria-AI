const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var CurrencyCostSchema = new Schema({
  _id: {type: String, required: true}, // id of currency used to buy this
  emote: {type: String, required: true}, // emote of currency
  value: {type: Number, required: true}
})

var ShopItemSchema = new Schema({
  _id: {type: String, required: true}, // item ID
  name: {type: String, required: true}, // humanized item name
  description: {type: String, required: true}, // what it does
  price: [CurrencyCostSchema] // values and IDs of currencies
});

// Model
var ShopItems = mongoose.model("ShopItems", ShopItemSchema); // Create collection model from schema
module.exports = ShopItems; // export model
