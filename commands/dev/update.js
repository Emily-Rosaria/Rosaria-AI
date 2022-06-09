const fs = require('fs');

module.exports = {
    name: 'update', // The name of the command
    aliases: ['refresh','reload'],
    description: 'Reloads all the commands and procedures!', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    allowDM: true,
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    group: 'dev',
    execute(message, args) {
      var client = message.client;
      console.log("Updating commands and functions...");
      const getAllCommands = function(dir, cmds) {
          files = fs.readdirSync(dir,{ withFileTypes: true });
          fileArray = cmds || [];
          files.forEach((file) => {
              if (file.isDirectory()) {
                  const newCmds = fs.readdirSync(dir+'/'+file.name);
                  fileArray = fileArray.concat(newCmds.map((f) => './../' + file.name + '/' + f));
              } else {
                  fileArray = fileArray.concat(['./../'+file.name]);
              }
          });
          return fileArray;
      };
      const commandFiles = getAllCommands('./commands');
      // Loops over each file in the command folder and sets the commands to respond to their name
      for (const file of commandFiles) {
          delete require.cache[require.resolve(file)];
          if (file.endsWith('.js')) {
            const command = require(file);
            client.commands.set(command.name, command);
          }
      }

      const slashFiles = fs.readdirSync('./music/commands',{ withFileTypes: true }).filter((file) => file.name.endsWith(".js")).map(file => './../../music/commands/'+file.name);
      // Loops over each file in the music commands folder and sets the commands to respond to their name
      for (const file of slashFiles) {
          delete require.cache[require.resolve(file)];
          if (file.endsWith('.js')) {
            const command = require(file);
            client.slashCommands.set(command.data.name, command);
          }
      }

      // Deletes commands that don't exist
      const keys = Array.from(client.commands.keys());
      const validCommands = commandFiles.filter(file => file.endsWith('.js')).map(x => require(x).name);
      console.log('New valid command list:');
      console.log(validCommands);
      for (const key of keys) {
          if (!validCommands.includes(key)) {
            console.log('Removing command '+key+' from cache.');
            delete client.commands.delete(key);
            client.commands.array();
          }
      }

      console.log('Commands updated and cleaned! Now starting on misc functions.');

      // Reset cache of misc function
      const miscFunctions = fs.readdirSync('./misc_functions',{ withFileTypes: true }).filter((f)=>f.name.endsWith('.js'));
      miscFunctions.forEach((miscF) => {
        delete require.cache[require.resolve('./../../misc_functions/'+miscF.name)];
      });


      delete require.cache[require.resolve('./../../guild_auto_prune.js')];
      delete require.cache[require.resolve('./../../bump_reminder.js')];

      console.log('Misc functions updated and cleaned! Now starting events.');

      // Time to reset the event stuff!
      const eventFunctions = fs.readdirSync('./events',{ withFileTypes: true }).filter((f)=>f.name.endsWith('.js'));
      eventFunctions.forEach((eventF) => {
        delete require.cache[require.resolve('./../../events/'+eventF.name)];
        const event = require('./../../events/'+eventF.name);
        client.events.set(event.name,event);
      });

      // Time to reset the button stuff!
      const buttonFunctions = fs.readdirSync('./buttons',{ withFileTypes: true }).filter((f)=>f.name.endsWith('.js'));
      buttonFunctions.forEach((buttonF) => {
        delete require.cache[require.resolve('./../../buttons/'+buttonF.name)];
        const button = require('./../../buttons/'+buttonF.name);
        client.buttons.set(button.name,button);
      });

      console.log('Events done, now reloading config.');

      delete require.cache[require.resolve('./../../config.json')];

      message.reply('Done! Database and core functions may require a reboot for the full changes to be pushed.');
      /*
      const spawns = Object.keys(client.spawnloops);
      for (const spawn of spawns) {
        client.clearTimeout(client.spawnloops[spawn]);
        client.spawnloops.delete(spawn);
        client.spawnloops.array();
      }
      const reSpawn = require('./../../pokemon/loadspawners.js');
      x = async () => {
        await reSpawn(client);
        console.log('Done! Pokemon and looping functions should begin shortly...');
        message.reply('Done! Pokemon and looping functions should begin shortly...');
      }
      x();
      */
    },
};
