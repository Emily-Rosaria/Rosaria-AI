const config = require('./../config.json'); // load bot config
const mongoose = require("mongoose"); //database library
const Users = require("./../database/models/users.js"); // users model
const Characters = require("./../database/models/characters.js"); // users model
const Intros = require("./../database/models/introductions.js"); // users model

module.exports = {
  name: "onLeave",
  async event(member) {
    return;
    chars = await Characters.find({author: member.user.id}).exec();
    if (!chars || chars.length == 0) {
      return;
    }
    var client = member.client;
    let channel = member.guild.channels.resolve(config.channels.characters);
    chars.forEach((post, i) => {
      if (post.channel != channel.id) {
        channel = member.guild.channels.resolve(post.channel);
      }
      channel.messages.fetch(post._id).then(msg => {
        msg.delete()
      }).catch(console.error);
    });
    Characters.deleteMany({author: member.user.id}).exec();

    intros = await Intros.find({author: member.user.id}).exec();
    if (!intros || intros.length == 0) {
      return;
    }
    channel = member.guild.channels.resolve(config.channels.intros);
    chars.forEach((post, i) => {
      if (post.channel != channel.id) {
        channel = member.guild.channels.resolve(post.channel);
      }
      channel.messages.fetch(post._id).then(msg => {
        msg.delete()
      }).catch(console.error);
    });
    Intros.deleteMany({author: member.user.id}).exec();
  },
};
