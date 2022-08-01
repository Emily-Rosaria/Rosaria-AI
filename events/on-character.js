const config = require('./../config.json'); // load bot config
const mongoose = require("mongoose"); //database library
const Users = require("./../database/models/users.js"); // users model
const Characters = require("./../database/models/characters.js"); // users model
const Intros = require("./../database/models/introductions.js"); // users model

module.exports = {
  name: "onCharacter",
  async event(message) {

    if (message.channel = config.intro) {

    }

    await Characters.findOneAndUpdate({
      _id: message.id,
      author: message.author.id,
      channel: message.channel.id,
      timestamp: message.createdAt.getTime(),
      approved: approved,
      introduction: (message.channel.id == config.introChannel)
    }, {upsert: true}).exec();
  },
};
