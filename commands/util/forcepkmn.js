module.exports = {
  name: 'forcepkmn', // The name of the command
  description: 'Forces a Pokémon spawn. For testing.', // The description of the command (for help text)
  cooldown: 10,
  args: false, // Specified that this command doesn't need any data other than the command
  perms: 'dev', //restricts to bot dev only (me)
  database: true,
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, db, args) {
    message.reply("This command is WIP.");
  },
};