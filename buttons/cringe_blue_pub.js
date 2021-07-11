module.exports = {
  name: "click_blue_pub",
  cooldown: 3,
  async click(button) {
    await button.clicker.fetch();
    const uID = button.clicker.user.id;
    await button.reply.send(`<@${uID}> took the blue pill, so that means they are cringe!`);
  },
};
