/**
 * This class responds to any dev that types r!test by running random bot code.
 *
 */
const fetch = require('node-fetch'); // This lets me get stuff from api.
const Discord = require('discord.js'); // For Embeds
const Canvas = require('canvas'); // Drawings

module.exports = {
  name: 'test', // The name of the command
  description: 'Tests stuff.', // The description of the command (for help text)
  args: true, // Specified that this command doesn't need any data other than the command
  perms: 'dev', //restricts to bot dev only (me)
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, args) {
    getGdocs = require('./../misc_functions/readgdocs.js');
    toHex = require('./../misc_functions/rgbtohex.js');
    const postNums = args.join(' ').match(/(^| )(count=)?d+( |$)/i);
    const postCount = postNums ? ((Math.number(postNums[0]) > 5) ? 5 : Math.number(postNums[0])) : 3;
    const splitPosts = !!args.join(' ').match(/(^| )(true|split|split=true)( |$)/i);
    const docLink = args.join(' ').match(/(^| )(\S*\/)?[a-zA-Z0-9-_]{20,}(\/\S*)?( |$)/);
    if (!docLink) { message.reply("Error. Could not find a document link."); return; }
    const docData = await getGdocs(docLink[0]).catch((err) => {
      message.reply("Could not access the document. Make sure it's public, then submit it again.");
      console.error(err);
      return;
    });
    const docUrl = 'https://docs.google.com/document/d/' + docData.documentId + '/';
    let img = null;
    let color = docData.documentStyle.background.color.color;
    if (JSON.stringify(color) === '{}' || !color) {
      color = "#f5f5f5";
    } else {
      if (color.rgbColor && color.rgbColor != {}) {
        color = toHex(256 * color.rgbColor.red - 1, 256 * color.rgbColor.green - 1, 256 * color.rgbColor.blue - 1);
      } else {
        color = "#f5f5f5";
      }
    }
    let title = docData.title;
    const content = docData.body.content;
    const blankContent = ['PreDoc', ''];
    let contentArray = blankContent;
    for (obj of content) {
      if (obj.paragraph) {
        if (img === null) {
          let imageID = obj.paragraph.positionedObjectIds;
          if (imageID && imageID.length != 0) {
            for (var i = 0; i < imageID.length && img === null; i++) {
              const embedInfo = docData.positionedObjects[imageID[i]].positionedObjectProperties.embeddedObject;
              if (embedInfo.imageProperties) {
                img = embedInfo.imageProperties.contentUri;
              }
            }
          }
          if (!imageID) {
            const inlineObjects = obj.paragraph.elements.filter((e) => !!e.inlineObjectElement);
            if (inlineObjects.length != 0) {
              const objectID = inlineObjects.reduce((acc, cur) => {
                if (acc === null) {
                  if (!!cur.inlineObjectElement.inlineObjectId) {
                    if (docData.inlineObjects[cur.inlineObjectElement.inlineObjectId].inlineObjectProperties.embeddedObject.imageProperties) {
                      return cur.inlineObjectElement.inlineObjectId;
                    } else {
                      return null;
                    }
                  } else {
                    return null;
                  }
                } else {
                  return acc;
                }
              }, null);
              if (!!objectID) {
                imageID = objectID;
                const embedInfo = docData.inlineObjects[imageID].inlineObjectProperties.embeddedObject;
                img = embedInfo.imageProperties.contentUri;
              }
            }
          }
        }
        if (obj.paragraph.paragraphStyle.namedStyleType == 'TITLE') {
          const newTitle = obj.paragraph.elements.reduce((acc, cur) => acc + cur.textRun.content, '').replace(/\n/, '');
          if (title == docData.title) {
            title = newTitle;
          }
          if (newTitle != '' && blankContent == contentArray) {
            contentArray = [[newTitle, '']];
          } else if (newTitle != '') {
            contentArray.push([newTitle, '']);
          }
        } else if ((obj.paragraph.paragraphStyle.namedStyleType == "HEADING_1") && contentArray.slice(-1)[0][0] != "HEADING_1") {
          const newTitle = obj.paragraph.elements.reduce((acc, cur) => acc + (cur.textRun ? cur.textRun.content : ''), '').replace(/\n/, '');
          if (newTitle != '' && blankContent == contentArray) {
            contentArray = [newTitle, ''];
          } else if (newTitle != '') {
            contentArray.push([newTitle, '']);
          };
        } else {
          for (const el of obj.paragraph.elements) {
            if (el.textRun) {
              ;
              let chunk = el.textRun.content;
              if (JSON.stringify(el.textRun.content) != '{}') {
                if (el.textRun.textStyle.link && el.textRun.textStyle.link.url !== '') {
                  chunk = '[' + chunk + ']' + '(' + el.textRun.textStyle.link.url + ')';
                } else if (el.textRun.textStyle.underlined && el.textRun.textStyle.underlined === true) {
                  chunk = '__' + chunk + '__';
                }
                if (el.textRun.textStyle.bold && el.textRun.textStyle.bold === true) {
                  chunk = '**' + chunk + '**';
                }
                if (el.textRun.textStyle.italic && el.textRun.textStyle.italic === true) {
                  chunk = '_' + chunk + '_';
                }
                if (el.textRun.textStyle.strikethrough && el.textRun.textStyle.strikethrough === true) {
                  chunk = "~~" + chunk + "~~";
                }
                contentArray[contentArray.length - 1] = [contentArray[contentArray.length - 1][0], contentArray.slice(-1)[0][1] += chunk];
              }
            }
          }
        }
      }
    }
    console.log(docData);
    const cleanRegex = /[\u200B\r\uE000-\uF8FF\u2028-\u2029]/g;
    if (img === null) {
      if (docData.positionedObjects) {
        const posKeys = Object.keys(docData.positionedObjects);
        for (var i = 0; i<length.posKeys && img != null; i++) {
          const embedObj = docData.positionedObjects[key].positionedObjectProperties.embeddedObject;
          if (embedObj.imageProperties) {
            console.log(embedObj.imageProperties);
            img = embedObj.imageProperties.contentUri;
          }
        }
      }
      if (docData.inlineObjects) {
        const inlineKeys = Object.keys(docData.inlineObjects);
        for (var i = 0; i<length.posKeys && img != null; i++) {
          const embedObj2 = docData.inlineObjects[key].inlineObjectProperties.embeddedObject;
          if (embedObj2.imageProperties) {
            console.log(embedObj2.imageProperties);
            img = embedObj2.imageProperties.contentUri;
          }
        }
      }
      console.log(img);
    }
    title = title.length > 250 ? title.substring(0, 250) + '...' : title;
    title = title.replace(cleanRegex, "");
    let imgDetails = false;
    if (img != null) {
      const docImg = await Canvas.loadImage(img);
      const canvas = Canvas.createCanvas(docImg.width, docImg.height);
      const ctx = canvas.getContext('2d');
      const fileName = title.replace(" ", "-").replace(/[^0-9a-zA-Z_\-.]/, "");
      ctx.drawImage(docImg, 0, 0, canvas.width, canvas.height);
      const attachment = new Discord.MessageAttachment(canvas.toBuffer(), fileName + '.png');
      imgDetails = [attachment, 'attachment://' + fileName + '.png'];
    }

    contentArray = contentArray.map((para) => [para[0].replace(cleanRegex, "").trim(), para[1].replace(cleanRegex, "").trim().replace(/\n{3,}/, '\n\n')]).filter((a) => a[1] != ''); //trim and remove blank elements
    const desc = contentArray[0][1].length > 2000 ? contentArray[0][1].substring(0, 2000) + '...' : contentArray[0][1];
    const footerText = 'Requested by ' + message.author.username + '#' + message.author.discriminator;
    let charCount = title.length + desc.length + footerText.length;
    const reducedContent = contentArray.length > 1 ? contentArray.slice(1).map((chunk) => {
      const title = chunk[0].length > 250 ? chunk[0].substring(0, 250) + '...' : chunk[0];
      const body = chunk[1].length > 1000 ? chunk[1].substring(0, 1000) + '...' : chunk[1];
      return [title, body];
    }) : [];
    let delayedPost = (array, index, maxReps, repsLeft) => {
      if (repsLeft === 0) { return };
      let thisRep = repsLeft;
      if (repsLeft === undefined) { thisRep = maxReps }
      if (index < array.length) {
        const docEmbed2 = new Discord.MessageEmbed()
          .setColor(color)
          .setDescription('\u200b')
          .setFooter(footerText)
        let size = footerText.length + ('\u200b').length;
        let finished = false;
        for (var i = index; !finished && i < array.length; i++) {
          const newSize = size + array[0].length + array[1].length;
          if (newSize < 6000) {
            docEmbed2.addField(reducedContent[i][0], reducedContent[i][1], false);
            size = newSize;
            if (i + 1 == array.length) {
              client.setTimeout(() => {
                message.channel.send(docEmbed2);
              }, 2000, docEmbed2);
              finished = true;
            }
          } else {
            client.setTimeout(() => {
              message.channel.send(docEmbed2);
              delayedPost(array, i, maxReps, thisRep - 1);
            }, 2000, array, i, maxReps, thisRep, docEmbed2);
            finished = true;
          }
        }
      }
    }
    const docEmbed = new Discord.MessageEmbed()
      .setColor(color)
      .setTitle(title)
      .setDescription(desc)
      .setTimestamp()
      .setURL(docUrl)
      .setFooter(footerText);
    for (const id in reducedContent) {
      const newChars = charCount + reducedContent[id][0].length + reducedContent[id][1].length;
      if (newChars < 6000) {
        docEmbed.addField(reducedContent[id][0], reducedContent[id][1], false);
        charCount = newChars;
      } else {
        delayedPost(reducedContent, id, postNums);
        break;
      }
    }
    if (imgDetails) {
      docEmbed.setImage(imgDetails[1]);
      message.channel.send({ files: [imgDetails[0]], embed: docEmbed });
    } else {
      message.channel.send(docEmbed);
    }
  },
};
