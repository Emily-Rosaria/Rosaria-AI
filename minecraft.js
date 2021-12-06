const Discord = require('discord.js'); // Embed

const statJSON = {
  "0": ["🔴","Offline","#FF0000","Offline"],
  "1": ["🟢","Online","#37d53f","Online"],
  "2": ["🟠","Starting","#fa7f26","Starting"],
  "3": ["🔴","Stopping","#FF0000","Offline"],
  "4": ["🟠","Restarting","#fa7f26","Starting"],
  "5": ["🔵","Saving","#2370dd","Offline"],
  "6": ["🟠","Loading","#fa7f26","Starting"],
  "7": ["🔴","Crashed","#FF0000","Crashed"],
  "8": ["🟠","Pending","#fa7f26","Pending"],
  "9": ["","???","#000000","Pending"],
  "10": ["🟠","Preparing","#fa7f26","Starting"]
};

module.exports = async function(logChannel, serverName) {
    require('dotenv').config(); //for .env file
    const {Client} = require('exaroton');
    const config = require('./config.json');
    const mcClient = new Client(process.env.MCTOKEN);
    let account = await mcClient.getAccount();
    console.log("My exaroton account is " + account.name + " and I have " + account.credits + " credits.");
    let server = [...await mcClient.getServers()].find(s=>serverName.toLowerCase()==s.name.toLowerCase());
    console.log("Subscribing to " + server.name + ". ID: " + server.id);
    let status = ""+server.status || "";
    let players = server.players.list || [];
    server.subscribe(); //server.subscribe("console");

    var msgObj = null;

    const pingRole = config.pings.mc;
    const title = server.name;
    const footer = server.address;

    // status updates
    server.on("status", async function(server) {
        const statusArr = statJSON[""+server.status];
        const dynamicIP = server.host && server.port ? ` If you're having trouble joining, try using the following dynamic IP instead: \`${server.host}:${server.port}\`` : "";
        // do updates for server status
        if ("" + server.status != "" + status) {
          status = "" + server.status;
          const embed = new Discord.MessageEmbed()
          .setTitle(title + " - Status Update")
          .setFooter(footer)
          .setColor(statusArr[2])
          .setTimestamp();
          if (""+server.status != "1") {
            if (["0"].includes(""+server.status)) {
              embed.setDescription(`**${server.name}** is now ${statusArr[1]}.`+dynamicIP)
              .addField("Status",`${statusArr[0]} ${statusArr[1]}`,true)
              .addField("Players",`${server.players.count}/${server.players.max}`,true)
              .addField("Software",`${server.software.name} ${server.software.version}`,true);
            } else if (["7"].includes(""+server.status)) {
              embed.setDescription(`**${server.name}** has ${statusArr[1]}!`);
            } else {
              embed.setDescription(`**${server.name}** is ${statusArr[1]}...`);
            }
            if (["5","0","6","2"].includes(""+server.status) && msgObj[num] != null) {
              msgObj = await msgObj.edit({embed: embed});
            } else {
              msgObj = await logChannel.send({embed: embed});
            }
          } else {
            embed.setDescription(`**${server.name}** is now ${statusArr[1]}!`)
            .addField("Status",`${statusArr[0]} ${statusArr[1]}`,true)
            .addField("Players",`${server.players.count}/${server.players.max}`,true)
            .addField("Software",`${server.software.name} ${server.software.version}`,true);
            const statusPing = "<@&" + pingRole + ">";
            msgObj = await logChannel.send({embed: embed, content: statusPing});
          }
        } else {
          status = "" + server.status;
        }

        // do posts for players joining/leaving
        if (server.players.list || players.length > 0) {
          const serverlist = server.players.list || [];
          // get players in the old list who aren't in the new one
          const leftPlayers = players.filter(p=>serverlist.indexOf(p) === -1);
          // get players in the new list who weren't in the old one
          const joinedPlayers = serverlist.filter(p=>players.indexOf(p) === -1);
          // server status text
          const statusArr = statJSON[""+server.status];

          // post for players who left
          if (server.status == "1") {
            for (let left of leftPlayers) {
              const embed = new Discord.MessageEmbed()
              .setFooter(footer)
              .setDescription(`**${left}** has logged off from ${server.name}! - [${server.players.count} / ${server.players.max} Online]`)
              .setColor("#FF0000")
              .setTimestamp();
              logChannel.send({embed: embed});
            }
          }

          // post for players who joined
          for (let joined of joinedPlayers) {
            const embed = new Discord.MessageEmbed()
            .setFooter(footer)
            .setDescription(`**${joined}** has logged on to ${server.name}! - [${server.players.count} / ${server.players.max} Online]`)
            .setColor("#37d53f")
            .setTimestamp();
            logChannel.send({embed: embed});
          }

          players = serverlist;

          // if the last player left, let people know the server may shut down soon
          if (""+server.status == "1" && (server.players.count == 0 || players.length == 0) && leftPlayers.length > 0) {
            const embed = new Discord.MessageEmbed()
            .setTitle(title + " - Server Notice")
            .setFooter(footer)
            .setDescription("As there are currently no players online, the server may automatically go offline in just under 10 minutes."+dynamicIP)
            .setColor("#37d53f")
            .addField("Status",`${statusArr[0]} ${statusArr[1]}`,true)
            .addField("Players",`${server.players.count}/${server.players.max}`,true)
            .addField("Software",`${server.software.name} ${server.software.version}`,true)
            .setTimestamp();
            logChannel.send({embed: embed});
          }
        } else {
          players = [];
        }
    });
};
