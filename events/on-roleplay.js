const mongoose = require("mongoose"); //database library
const Users = require("./../database/models/users.js"); // users model
const Lastposts = require("./../database/models/lastposts.js"); // messages model

module.exports = {
  name: "onRoleplay",
  async event(message) {
    return;
    /*
    const splitMSG = message.content.split('```');
    let cleanMSG = splitMSG.filter((e,i)=>i % 2 == 0 || (i+1 < splitMSG.length && splitMSG.length % 2 == 0)).join(' '); // remove content in code blocks
    cleanMSG = cleanMSG.replace(/[*_~|`>]+/,'').trim(); // remove formatting characters
    cleanMSG = cleanMSG.replace(/\s{2,}/,' '); // remove excessive line breaks and double spaces
    cleanMSG = cleanMSG.replace(/\p{M}+/,''); // remove zalgo text ("mark characters")
    const chars = cleanMSG.length;
    const words = chars == 0 ? 0 : cleanMSG.split(/\s+/).length;
    await Messages.create({
      _id: message.id,
      author: message.author.id,
      channel: message.channel.id,
      wordCount: words,
      charCount: chars,
      timestamp: message.createdAt.getTime()
    });

    if (chars == 0) {
      return;
    }

    if (chars < 200 && !message.embeds && !message.embeds.length > 0) {
      const lastpost = await Lastposts.findOneById({_id: message.channel.id}).exec();
      if (!lastpost || lastpost.length < 200 || lastpost.userID != message.author.id) {
        // handle OOC stuff
        return;
      }
    }

    // update user word/char counts
    await Lastposts.findByIdAndUpdate()({_id: message.channel.id},{
      messageID: message.id,
      userID: message.author.id,
      timestamp: message.createdTimestamp,
      length: chars
    }, {upsert: true}).exec();

    // update user word/char counts
    const oldUserData = await Users.findOneAndUpdate({_id: message.author.id},{
      "$inc": {
        "totalChars": chars,
        "totalWords": words
      }
    }, {upsert: true}).exec();

    if (oldUserData) {
      if (oldUserData.xp) {
        const oldQuestData = oldUserData.quests.find(q=>q._id==message.channel.id);
        if (oldQuestData && oldQuestData.wordCount > 0 && oldQuestData.charCount > 0) {
          await Users.updateOne({
            _id: message.author.id,
            "quests._id": message.channel.id
          },{
            "$inc": {
              "quests.$.charCount": chars,
              "quests.$.wordCount": words
            }
          }).exec();
        } else {
          await Users.updateOne({_id: message.author.id},{
            "$push": {
              "quests":{
                "_id": message.channel.id,
                "startTime": message.createdAt.getTime(),
                "firstMSG": Number(message.id),
                "charCount": chars,
                "wordCount": words
              }
            }
          }).exec();
        }
      } else {
        await Users.updateOne({_id: message.author.id},{
          "$set": {
            "quests":[{
              "_id": message.channel.id,
              "startTime": message.createdAt.getTime(),
              "firstMSG": Number(message.id),
              "charCount": chars,
              "wordCount": words
            }]
          }
        }).exec();
      }
    }
    */
  },
};
