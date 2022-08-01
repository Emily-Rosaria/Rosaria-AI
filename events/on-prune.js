const mongoose = require("mongoose"); //database library
const Prune = require("./../database/models/prune.js"); // users model

module.exports = {
  name: "onPrune",
  async event(message) {
    if (!message) return;
    await Prune.create({
      _id: message.id,
      author: message.author.id,
      channel: message.channel.id,
      timestamp: message.createdAt.getTime()
    });
  },
};
