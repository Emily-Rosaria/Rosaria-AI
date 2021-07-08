
module.exports = async function(data) {
  const data = await doctest(args[0]);
  const title = data.title;
  var text = "";

  const formats = {
    "bold":"**",
    "italics":"*",
    "underlined":"__",
    "strikethrough":"~~"
  };

  const styles = {
    "TITLE":"**__",
    "SUBTITLE":"*",
    "HEADING_1":"**",
    "HEADING_2":"***",
    "HEADING_3":"*"
  };

  var images = [];

  for (const el of data.body.content) {
    if (el.paragraph) {
      let para_format = "";
      let para_format_temp = "";
      if (el.paragraph.paragraphStyle && el.paragraph.paragraphStyle.namedStyleType && styles[el.paragraph.paragraphStyle.namedStyleType]) {
        para_format = styles[el.paragraph.paragraphStyle.namedStyleType];
        para_format_temp = para_format;
      }
      for (const run of el.paragraph.elements) {
        if (run.textRun) {
          const textRun = run.textRun;
          let flair = "";
          if (textRun.textStyle && textRun.textStyle.bold) {
            flair = flair + formats.bold;
          }
          if (textRun.textStyle && textRun.textStyle.italics) {
            flair = flair + formats.italics;
          }
          if (textRun.textStyle && textRun.textStyle.underlined) {
            flair = flair + formats.underlined;
          }
          if (textRun.textStyle && textRun.textStyle.strikethrough) {
            flair = flair + formats.strikethrough;
          }
          text = text + textRun.content.replace(/^(\s*)(\S)/,`$1${para_format_temp+flair}$2`).replace(/(\S)(\s*)$/,`$1${flair.split('').reverse().join('')}$2`);
          para_format_temp = "";
        }
      }
      if (text && text.trim().length > 0 && para_format.length > 0) {
        text = text.replace(/(\S)(\s*)$/,`$1${para_format.split('').reverse().join('')}$2`);
      }
    }
  }
  text = text.replace(/[\ue000-\uf8ff]/gu,'').replace(/\u000b/gu,'\n').replace(/\n(\n\n?)\n*/g,'$1');
  return text;
};
