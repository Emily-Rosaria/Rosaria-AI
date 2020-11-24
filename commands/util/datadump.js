/**
 * This class responds to any dev that types r!test by running random bot code.
 *
 */

module.exports = {
  name: 'datadump', // The name of the command
  description: 'Dumps all the bot date into the console.', // The description of the command (for help text)
  args: false, // Specified that this command doesn't need any data other than the command
  perms: 'dev', //restricts to bot dev only (me)
  database: true,
  aliases: ['dump'],
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, db, args) {
    var temp = await db.getAll();
    console.log(temp);
  },
};