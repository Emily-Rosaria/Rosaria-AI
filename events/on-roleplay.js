const mongoose = require("mongoose"); //database library
const Users = require("./../database/models/users.js"); // users model
const Messages = require("./../database/models/messages.js"); // users model

module.exports = {
  name: "onRoleplay",
  async event(message) {

    const splitMSG = message.content.split('```');
    let cleanMSG = splitMSG.filter((e,i)=>i % 2 == 0 || (i+1 < splitMSG.length && splitMSG.length % 2 == 0)).join(' '); // remove content in code blocks
    cleanMSG = cleanMSG.replace(/[*_~|`<>\\]+/,'').trim(); // remove formatting characters
    cleanMSG = cleanMSG.replace(/\s{2,}/,' '); // remove excessive line breaks and double spaces
    cleanMSG = cleanMSG.replace(/\p{M}+/,''); // remove zalgo text ("mark characters")
    const chars = cleanMSG.length;
    const words = chars == 0 ? 0 : cleanMSG.split(/\s+/).length;
    await Messages.findOneAndUpdate({
      _id: message.id,
      author: message.author.id,
      channel: message.channel.id,
      wordCount: words,
      charCount: chars,
      timestamp: message.createdAt.getTime()
    }, {upsert: true}).exec();

    if (chars == 0) {
      return;
    }
    const xp = Math.round((config.xpMult*chars + Number.EPSILON) * 100) / 100;
    // update user word/char counts
    const oldUserData = await Users.findOneAndUpdate({_id: message.author.id},{
      "$inc": {
        "totalChars": chars,
        "totalWords": words,
        "xp": xp
      }
    }, {upsert: true}).exec();
  },
};
