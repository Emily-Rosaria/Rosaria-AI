var seedrandom = require('seedrandom');
var Jimp = require('jimp');
const Discord = require('discord.js'); // Image embed

function random_unit_vector(rng,amp,wl) {
    let theta = rng() * 2 * Math.PI;
    return {
        x: (amp||1)*Math.cos(wl*theta),
        y: (amp||1)*Math.sin(wl*theta)
    };
}

function random_vec_grid(nodes,rng,amp,wl) {
  let grid = [];
  for (let i = 0; i < nodes; i++) {
    let row = [];
    for (let j = 0; j < nodes; j++) {
      row.push(random_unit_vector(rng,amp,wl));
    }
    grid.push(row);
  }
  return grid;
}

function smoothstep(x) {
    return 6*x**5 - 15*x**4 + 10*x**3;
}

function interpolate(x, a, b) {
    return a + smoothstep(x) * (b-a);
}

function pickHex(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}

module.exports = {
    name: 'heightmap', // The name of the command
    description: 'Test the heightmap code for worldgen.', // The description of the command (for help text)
    args: 1, // Specified that this command doesn't need any data other than the command
    perms: 'dev', //restricts to users with the "verifed" role noted at config.json
    usage: '<seed> [nodes] ["[amp1,amp2,amp3...]"] ["[wave1,wave2,wave3...]"]', // Help text to explain how to use the command (if it had any arguments)
    group: 'dev',
    allowDM: true,
    async execute(message, args) {
      var rng = seedrandom(args[0]);

      let nodes = args.length > 1 ? Number(args[1]) || 8 : 8;
      nodes = Math.max(2,Math.min(nodes,32));

      var amps = [0.1,0.4,0.9];
      var waves = [1,1.2,4];
      if (args.length > 2) {
        const ampWaves = args.slice(2).join(' ').match(/\[[ \d,]*\]/g);
        if (ampWaves && ampWaves.length > 0) {
          if (!ampWaves[0].match(/\[ *\]/)) {
            amps = ampWaves[0].split(/[,;: ]/).map(a=>Math.min(1,Math.abs(Number(a))));
          }
          if (ampWaves.length > 1 && !ampWaves[1].match(/\[ *\]/)) {
            waves = ampWaves[0].split(/[,;: ]/).map(w=>Number(w));
          }
          if (amps.length > waves.length) {
            amps = amps.slice(0,waves.length);
          } else if (amps.length < waves.length) {
            waves = waves.slice(0,amps.length);
          }
        }
      }
      const layers = amps.length;
      const maxAmp = amps.reduce((a,b)=>a+b,0);

      let grids = [...new Array(layers)].map((a,i)=>random_vec_grid(nodes,rng,amps[i],waves[i]));

      var gradients = [...new Array(layers)].map(a=>{
        return {};
      });

      const dot_prod_grid = (layer, x, y, vx, vy) => {
        let d_vect = {x: x - vx, y: y - vy};
        let g_vect;
        if (gradients[layer][[vx,vy]]){
          g_vect = gradients[layer][[vx,vy]];
        } else {
          g_vect = grids[layer][vx][vy];
          gradients[layer][[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
      }

      const perlin = (offset,inc) => {
        var display = [];
        for (let x = (offset||0.5); x <= nodes-1; x+=(inc||1)) {
          let row = [];
          for (let y = (offset||0.5); y <= nodes-1; y+=(inc||1)) {
            let v = 0;
            for (let l = 0; l < layers; l++) {
              let xf = Math.floor(x);
              let yf = Math.floor(y);
              let tl = dot_prod_grid(l, x, y, xf, yf);
              let tr = dot_prod_grid(l, x, y, xf+1, yf);
              let bl = dot_prod_grid(l, x, y, xf,   yf+1);
              let br = dot_prod_grid(l, x, y, xf+1, yf+1);
              let xt = interpolate(x-xf, tl, tr);
              let xb = interpolate(x-xf, bl, br);
              v = v + interpolate(y-yf, xt, xb);
            }
            row.push(v);
          }
          display.push(row);
        }
        return display;
      }

      const toColor = (num) => {
        const a = 255;
        const unitNum = 0.5*(num+maxAmp)/maxAmp;
        let hex = pickHex([255,0,64], [0,255,0], unitNum);
        return Jimp.rgbaToInt(hex[0], hex[1], hex[2], a);
      }

      let numMap = perlin(0.5,1).map(r=>r.map(r=>r.toFixed(3)).join(' ')).join('\n');
      message.reply("```\n"+numMap+"\n```");

      const inc = (nodes-1)/600;

      let image = new Jimp(600, 600, function (err, img) {
        if (err) throw err;

        perlin(inc,inc).forEach((row, y) => {
          row.forEach((val, x) => {
            img.setPixelColor(toColor(val), x, y);
          });
        });
        img.write("pain.png");
        img.getBufferAsync(Jimp.MIME_PNG).then(buffer=>{
          const attachment = new Discord.MessageAttachment(buffer, 'heightmap.png');
          const embed = new Discord.MessageEmbed()
          .setColor('#2e51a2')
          .setImage('attachment://heightmap.png')
          .setFooter('Emily suffered to make this')
          .setTimestamp()
          message.channel.send({embed: embed, files: [attachment]});
        }).catch(err=>console.err(error));
      });
    },
};
