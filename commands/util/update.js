const fs = require('fs');

module.exports = {
    name: 'update', // The name of the command
    aliases: ['refresh','reload'],
    description: 'Reloads all the commands and procedures!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    execute(message, args) {
      console.log("Updating commands and functions...");
      const getAllCommands = function(dir, cmds) {
          files = fs.readdirSync(dir,{ withFileTypes: true });
          fileArray = cmds || [];
          files.forEach((file) => {
              if (file.isDirectory()) {
                  const newCmds = fs.readdirSync(dir+'/'+file.name);
                  fileArray = fileArray.concat(newCmds.map((f) => './../' + file.name + '/' + f).filter((f)=>f.endsWith('.js')));
              } else if (file.name.endsWith('.js')) {
                  fileArray = fileArray.concat(['./../'+file.name]);
              }
          });
          return fileArray;
      };
      const commandFiles = getAllCommands('./commands').filter(file => file.endsWith('.js'));
      // Loops over each file in the command folder and sets the commands to respond to their name
      for (const file of commandFiles) {
          delete require.cache[require.resolve(file)];
          const command = require(file);
          message.client.commands.set(command.name, command);
      }

      // Deletes commands that don't exist
      const keys = Array.from(message.client.commands.keys());
      const validCommands = commandFiles.map(x => require(x).name);
      console.log('New valid command list:');
      console.log(validCommands);
      for (const key of keys) {
          if (!validCommands.includes(key)) {
            console.log('Removing command '+key+' from cache.');
            delete message.client.commands.delete(key);
          }
      }

      console.log('Commands updated and cleaned! Now starting on misc functions.');
misc_functions
      // Reset cache of misc function
      const miscFunctions = fs.readdirSync('../../../misc_functions',{ withFileTypes: true }).filter((f)=>f.endsWith('.js'));
      miscFunctions.forEach((miscF) => {
        delete require.cache[require.resolve(miscF)];
      });

      console.log('Misc functions updated and cleaned! Now starting function loops (namely pokemon spawns).');

      // Time to reset the pokemon command!
      delete require.cache[require.resolve('./../../pokemon/pokemon.js')];
      delete require.cache[require.resolve('./../../pokemon/loadspawner.js')];
      const spawns = Object.keys(client.spawnloops);
      for (const spawn of spawns) {
        client.clearTimeout(client.spawnloops[spawn]);
        client.spawnloops.delete(spawn);
      }
      const reSpawn = require('./../../pokemon/pokemon.js');
      x = async () => {
        await reSpawn(client);
        console.log('Done! Pokemon and looping functions should begin shortly...');
        message.reply('Done! Pokemon and looping functions should begin shortly...');
      }
      x();
    },
};
