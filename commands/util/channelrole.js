const fs = require('fs');

module.exports = {
  name: 'channelrole', // The name of the command
  description: 'Assigns a role to all users that have posted in this channel.', // The description of the command (for help text)
  args: true, // Specified that this command doesn't need any data other than the command
  perms: 'admin', //restricts to admins
  client: true,
  usage: '<role-to-assign> [search itterations]', // Help text to explain how to use the command (if it had any arguments)
  async execute(message, client, args) {
    var messages = [{id: message.id, userID: message.author.id}];
    const role = message.guild.roles.cache.get(args[0].match(/\d+/g)[0]);
    //if (!role) {message.reply('Invalid Role ID.'); return;}
    var i = 0;
    const itts = (args.length > 1 && isNAN(args[1])) ? 10 : Math.abs(Math.round(Number(args[1]))) || 1;
    var lengthIncrease = 1;
    while (i < args[0] && lengthIncrease) {
      fetched = await message.channel.messages.fetch({ before: messages.slice(-1)[0].id, limit: 100 }, true, true )
      .catch((err) => {message.reply('Unable to fetch messages.'); console.error(err); return;});
      const newMessages = fetched.map(msg => {return {id: msg.id, userID: msg.author.id};});
      lengthIncrease = newMessages.length == 0;
      console.log('Latest Timestamp: '+newMessages.slice(-1)[0].timestamp);
      messages = messages.concat(newMessages);
      var i = i + 1;
      console.log('Itteration: '+i.toString()+'\nArray Length: '+messages.length.toString());
    }
    var userList = [];
    for (const msg of messages) {if (!userList.includes(msg.userID)) {userList = userList.concat([msg.userID]);}};
    var memberList = userList.map( async (uid) => {
      const out = await message.guild.members.fetch(uid)
      .then((m) => m).catch(async () => {
        await client.users.fetch(uid)
        .then((u) => u)
        .catch(() => "Could not find.")
      }).finally((out) => out);
      return out;
    });
    var given = [];
    for (const uid of userList) {
      await message.guild.members.fetch(uid).then(async (m) => {
        if (!m.user.bot) {
          await m.roles.add(role);
          given = given.concat([m.user.username]);
          console.log(m.user.username+' was given the '+role.name+' role.');
        } else {
          console.log(m.user.username+' was not given the '+role.name+' as they are a bot.');
        }
      }).catch( async() => {
        await client.users.fetch(uid).then((u)=>{
          console.log(m.username+' was not given the '+role.name+' as they are no longer in this guild.');
        }).catch(() => {
          console.log('Could not find user or member with this ID.');
        });
      });
    }
    message.reply('The '+role.name+' role was given to '+given.length.toString()+' new users who have posted in this channel.');
    console.log(given);
  },
};