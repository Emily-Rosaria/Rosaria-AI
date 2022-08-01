const config = require('./../config.json'); // load bot config
const mongoose = require("mongoose"); //database library
const Users = require("./../database/models/users.js"); // users model
const Messages = require("./../database/models/messages.js"); // messages model

module.exports = {
  name: "onEdit",
  async event(oldMessage, newMessage) {

    if (newMessage.partial && !newMessage.client) {
      return;
    }

    if (!config.rpChannels.includes(newMessage.channel.id)) {
      return;
    }

    const oldData = await Messages.findById(newMessage.id).exec();
    if (!oldData) {
      return;
    }

    let content = newMessage.content;

    const cID = oldData ? oldData.channel : (newMessage.channel ? newMessage.channel.id : false);
    const uID = oldData ? oldData.author : (newMessage.author ? newMessage.author.id : false);
    const timestamp = newMessage.editedAt ? newMessage.editedAt.getTime() : (new Date()).getTime();
    if (!uID || !cID) {
      return;
    }

    if (!content && newMessage.partial) {
      content = await newMessage.fetch().then((m)=>m.content);
    }
    if (!content || !content.length) {
      return;
    }

    const userData = await Users.findById(uID).exec();

    if (!userData ) {
      return;
    }

    const splitMSG = content.split('```'); // split around ``` to find content between pairs of them
    let cleanMSG = splitMSG.filter((e,i)=>i % 2 == 0 || (i+1 < splitMSG.length && splitMSG.length % 2 == 0)).join(' ');
    cleanMSG = cleanMSG.replace(/[*_~|`<>\\]+/,'').trim(); // remove formatting characters
    cleanMSG = cleanMSG.replace(/\s{2,}/,' '); // remove excessive line breaks and double spaces
    cleanMSG = cleanMSG.replace(/\p{M}+/,''); // remove zalgo text ("mark characters")
    const chars = cleanMSG.length;
    const words = chars == 0 ? 0 : cleanMSG.split(/\s+/).length;

    const oldMessageData = await Messages.findByIdAndUpdate(newMessage.id,{
      "$set": {
        author: uID,
        channel: cID,
        wordCount: words,
        charCount: chars,
        timestamp: timestamp
      }
    },{upsert: false, new: false}).exec(); // update then return old message data (if it exists)

    if (!oldMessageData) {
      return;
    }

    const wordChange = words - oldMessageData.wordCount;
    const charChange = chars - oldMessageData.charCount;
    const xpChange = Math.round((config.xpMult*charChange + Number.EPSILON) * 100) / 100;
    if (wordChange != 0 || charChange != 0) {
      await Users.updateOne({_id: uID},{
        "$inc": {
          "totalChars": charChange,
          "totalWords": wordChange,
          "xp": xpChange
        }
      }).exec();
    }
  },
};
