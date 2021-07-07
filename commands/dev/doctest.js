
module.exports = {
    name: 'doctest', // The name of the command
    description: 'Test the gdocs reading function.', // The description of the command (for help text)
    args: true, // Specified that this command doesn't need any data other than the command
    perms: 'dev', //restricts to users with the "verifed" role noted at config.json
    usage: '<doc-link>', // Help text to explain how to use the command (if it had any arguments)
    group: 'dev',
    allowDM: true,
    async execute(message, args) {
      const doctest = require('./../../misc_functions/readgdocs.js'); // load gdocs function
      const data = await doctest(args[0]);
      const title = data.title;
      var text = "";

      const formats = {
        "bold":"**",
        "italics":"*",
        "underlined":"__",
        "strikethrough":"~~"
      };

      var images = [];

      for (const el of data.body.content) {
        if (element.paragraph) {
          for (const run of element.paragraph.elements) {
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
            text = text + textRun.content.replace(/^(\s+)(\S)/,`$1${flair}$2`).replace(/(\S)(\s+)$/,`$1${flair.split('').reverse().join('')}$2`);
          }
        }
      }
      console.log(text);
    },
};
