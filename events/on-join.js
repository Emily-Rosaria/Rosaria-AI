const config = require('./../config.json'); // load bot config
const oneHour = 60 * 60 * 1000; // one hour in milliseconds
const oneDay = oneHour * 24; // one day in milliseconds

function yeet(member, message, reason, leeway) {
  if (leeway) {
    member.client.automods.set(member.user.id,(new Date()).getTime()+leeway);
    setTimeout(() => member.client.automods.delete(member.user.id), leeway);
  }
  member.user.send(message).then(msg=> {member.kick(reason)}).catch(msg=> {member.kick(reason)});
}

module.exports = {
  name: "onJoin",
  async event(member) {

    let leeway = member.client.automods.get(member.user.id);

    if (leeway) {
      member.client.automods.delete(member.user.id);
      if (leeway > (new Date()).getTime() && member.user.avatar) {
        return; // don't kick whitelisted users who have a profile pic
      }
    }

    if (member.user.createdAt.getTime() + oneDay*7 < (new Date()).getTime()) {
      return; // do nothing if the user is older than 7 days
    }

    if (member.user.createdAt.getTime() + oneHour*4 > (new Date()).getTime()) {
      yeet(member, "As your account is really new, you've been flagged as a likely bot. Because of this, you've been automatically kicked from **Rosaria [18+]**. Rejoin in a day or so, or ask a friend on the server to vouch for you.","Super new account.");
      return;
    }

    if (!member.user.avatar) {
      yeet(member, "You've been flagged as a likely bot/spammer account due to your lack of profile image and new account age. Because of this, you've been automatically kicked from **Rosaria [18+]**. If you're a genuine user, feel free to set up a profile picture/avatar and rejoin within the next few hours.","New account and no profile pic. Likely bot. May rejoin.",oneHour*4);
      return;
    }
  },
};
