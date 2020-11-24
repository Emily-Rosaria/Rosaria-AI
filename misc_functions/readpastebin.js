const fetch = require('node-fetch');

module.exports = {
    name: 'readpastebin', // The name of the command
    description: 'Gets raw text from public/unlisted pastebin link.', // The description of the command (for help text)
    async execute(link) {
      const regex = /dog/gi;
      const pastelink = 'https://pastebin/raw/' + link.replace(/https:\/\//i,'').replace(/www\./i,'').replace(/pastebin\.com/,'').replace(/\/raw/,'').split('/W')[0];
      const text = await fetch(pasteLink).then((t) => t.text()).catch(()=> return '');
      return text;
    },
};
