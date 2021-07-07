module.exports = {
  name: "onButton",
  async event(button) {
    const clicked = client.buttons.get(button.id) || client.buttons.find(btn => btn.aliases && btn.aliases.includes(button.id));
    if (clicked) {
      return clicked.click(button);
    } else {
      await button.reply.send(`An unknown button was clicked!`,true);
    }
  },
};