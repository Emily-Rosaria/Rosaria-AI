/**
 * This class responds to any dev that types r!kill by killing an interval.
 *
 */

 const GuildData = require('./../../database/models/guilds.js');


module.exports = {
    name: 'settings', // The name of the command
    description: 'Adjust guild config', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    usage: '<option> <value>', // Help text to explain how to use the command (if it had any arguments)
    args: 2,
    allowDM: false,
    execute(message, args) {
      if (args[0].toLowerCase() == 'prefix') {
        const guildID = message.guild.id;
        if (args.length > 1) {
          const newprefixes = args.map(a=>a.toLowerCase());
          newprefixes.shift();
          GuildData.findByIdAndUpdate(guildID,{prefix:newprefixes},{new: true, upsert: true},(err, doc)=>{
            const newPrefixData = doc.prefix.join(', ');
            message.reply("The guild's new prefixes are `"+newPrefixData+"`.");
            console.log("Guild data updated: "+message.guild.name+".");
            console.log(doc);
          });
          return;
        }
      }
      message.reply("Invalid arguments.")
    }
};
