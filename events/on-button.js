const Discord = require('discord.js'); // Loads the discord API library

module.exports = {
  name: "onButton",
  async event(button) {
    const client = button.client;
    const clicked = client.buttons.get(button.id) || client.buttons.find(btn => (btn.aliases && btn.aliases.includes(button.id)) || (btn.prefix && button.id.startsWith(btn.prefix)));

    // end if unknown button was clicked
    if (!clicked) {
      return button.reply.send(`An unknown button was pushed. Did you set up the buttons correctly? If so, try again in a minute. Maybe there was an API error.`,true);
    }

    // manage cooldowns if relevant
    if (clicked.cooldown && clicked.cooldown > 0) {
      const cooldowns = client.cooldowns;
      if(!cooldowns.has("btn_"+clicked.name)) {
        cooldowns.set("btn_"+clicked.name, new Discord.Collection());
      }

      // get cooldown duration
      const now = Date.now();
      const timestamps = cooldowns.get("btn_"+clicked.name);
      const cooldownAmount = Math.max(1,(clicked.cooldown || 3 )) * 1000;

      // get user ID
      await button.clicker.fetch();
      const uID = button.clicker.user.id;

      if(!timestamps.has(uID)) {
        timestamps.set(uID, now);
        setTimeout(() => timestamps.delete(uID), cooldownAmount);
      } else {
        const expirationTime = timestamps.get(uID) + cooldownAmount;

        if(now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return button.reply.send(`Whoa! You're clicking too fast! Please wait ${timeLeft.toFixed(1)} more second(s) before clicking this button type again!`,true);
        }
        timestamps.set(uID, now);
        setTimeout(() => timestamps.delete(uID), cooldownAmount);
      }
    }

    // do click action
    return clicked.click(button);
  },
};
