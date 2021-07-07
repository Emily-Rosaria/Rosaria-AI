
module.exports = {
    name: 'clicky', // The name of the command
    description: 'Make the bot say random predetermined phrases (this is mostly a test function).', // The description of the command (for help text)
    args: false, // Specified that this command doesn't need any data other than the command
    perms: 'dev', //restricts to users with the "verifed" role noted at config.json
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    execute(message, args) {
      message.delete({ timeout: 1000 });
      const { MessageButton, MessageActionRow } = require('discord-buttons');

      let button = new MessageButton()
      .setStyle('red')
      .setLabel('Red Pill')
      .setID('click_red')

      let button2 = new MessageButton()
      .setStyle('blurple')
      .setLabel('Blue Pill')
      .setID('click_blue')

      let row = new MessageActionRow()
      .addComponents(button, button2);

      message.channel.send('What pill do you take?', row);

      message.client.on('click_red', async (button) => {
          await button.reply.send('You took the red pill, so that means you are based!', true)
      });

      message.client.on('click_blue', async (button) => {
          await button.reply.send('You took the blue pill, so that means you are cringe!', true)
      });
    },
};
