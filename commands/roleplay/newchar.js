module.exports = {
    name: 'newchar', // The name of the command
    description: 'Format an easily accessed character sheet to share with others!', // The description of the command (for help text)
    perms: 'basic', //restricts to bot dev only (me)
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    allowDM: true,
    group: 'roleplay',
    rose: true,
    execute(message, args) {
      message.reply("This command is work in progress.");
    },
};
