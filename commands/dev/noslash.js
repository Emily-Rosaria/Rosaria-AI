/**
 * This class responds to any dev that types r!kill by killing an interval.
 *
 */

module.exports = {
    name: 'noslash', // The name of the command
    description: 'Remove slash command perms', // The description of the command (for help text)
    perms: 'dev', //restricts to bot dev only (me)
    usage: '', // Help text to explain how to use the command (if it had any arguments)
    args: false,
    allowDM: false,
    execute(message, args) {
      message.guild.roles.fetch().then((roles)=>{
        roles.cache.each(async (role)=>{
          if (role.editable) {
            if (!['830226022174949386','840490042018889748','728685516358418442','727570442818420777','776927643319795763','776927641789661204','727570445360169000','775838711728177242','728276891764523041','728276752375349366','727570941491544065','728307087444148286','728305596729786458','727570376850407544','728407039595773982','775997760419004417','778295530278879274','728405506108162089','728321425106272331','728321431473094690','808593202222202926','728362216885321850','727569853405200474'].includes(role.id)) {
              await role.setPermissions(0);
            }
          }
        });
      }).catch((err)=>console.error(err));
      message.reply("Done?");
    }
};
