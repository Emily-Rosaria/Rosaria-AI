
module.exports = {
    name: 'chartest', // The name of the command
    description: 'Test the character reading function.', // The description of the command (for help text)
    args: true, // Specified that this command doesn't need any data other than the command
    perms: 'dev', //restricts to users with the "verifed" role noted at config.json
    usage: '<doc-text>', // Help text to explain how to use the command (if it had any arguments)
    group: 'dev',
    allowDM: true,
    async execute(message, args) {
      const chartest = require('./../../misc_functions/char-to-data.js'); // load gdocs function
      const data = await chartest(args.join(' '));
      const reply = [];
      for (const key of Object.keys(data)) {
        if (data[key].trim().split('\n').length > 1) {
          reply.push(`\n**${key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}:** ${data[key].trim()}\n`);
        } else {
          reply.push(`**${key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}:** ${data[key].trim()}\n`);
        }
      }
    },
};
