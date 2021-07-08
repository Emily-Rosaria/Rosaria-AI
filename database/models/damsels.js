const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
/*
var LewdSchema = new Schema({
    boobs: {type: Boolean, required: true},
    pussy: {type: Boolean, required: true},
    clit: {type: Boolean, required: true},
    butt: {type: Boolean, required: true},
    dick: {type: Boolean, required: true}
});
*/

var ToySchema = new Schema({
    type: {type: String, required: true}, // e.g. vibrator, butt plug, etc.
    remove: {type: Number, required: true}, // difficulty to remove, -1 = impossible
    charge: {type: Number, required: true}, // current 'charge', if -1 then it can't be charged
    recharge: {type: Boolean, required: true}, // whether or not it can be recharged through magic
    power: {type: Number, required: true}, // how strong it is (influences lewd things and how fast it uses charge)
    passive: {type: Boolean}, // whether to do lewd things at 1/4 power even when not charged
    canOrgasm: {type: Boolean}, // whether the toy can make a damsel orgasm (so long as its power is above the average of her endurance and mind)
    description: {type: String} // for players to read
});

var ToysSchema = new Schema({
    boobs: {type: ToySchema},
    pussy: {type: ToySchema},
    clit: {type: ToySchema},
    butt: {type: ToySchema}
    //dick: {type: ToySchema}
});

var BindingSchema = new Schema({
    type: {type: String, required: true}, // e.g. leather, rope, ribbon, etc.
    unlock: {type: Number, required: true}, // -1 means impossible, 0 is unlocked, 1+ means possible to unlock with lockpicks
    unclasp: {type: Number, required: true}, // difficulty to "undo" knots or buckles, etc.
    struggle: {type: Number, required: true}, // difficulty to wiggle free
    cut: {type: Number, required: true}, // difficulty to cut through
    description: {type: String} // for players to read
});

var BondageSchema = new Schema({
    blindfold: {type: BindingSchema},
    stuffing: {type: BindingSchema},
    gag: {type: BindingSchema},
    collar: {type: BindingSchema},
    arms: {type: BindingSchema},
    hands: {type: BindingSchema},
    thighs: {type: BindingSchema},
    legs: {type: BindingSchema},
    ankles: {type: BindingSchema},
    feet: {type: BindingSchema},
    torso: {type: BindingSchema},
    hips: {type: BindingSchema}
});

var SpellSchema = new Schema({
    name: {type: String, required: true}, // name of the spell
    components: {type: String, required: true}, // body part required for casting, e.g. legs, arms, hands, etc.
    cost: {type: Number, required: true}, // stamina cost of the spell
    effect: {type: String, required: true}, // effect of the spell, whether flavourful or otherwise
    description: {type: String} // for players to read
});

var StatusSchema = new Schema({
    name: {type: String, required: true}, // name of the status
    duration: {type: Number, required: true} // timestamp of when the status will end
});

var StatsSchema = new Schema({
  arcane: {type: Number, default: 3}, // magic stat, for magic damage and so on
  deftness: {type: Number, default: 3}, // evasion stat, for sneaky or precise things
  endurance: {type: Number, default: 3}, // endurance stat, for stamina stuff and such
  strength: {type: Number, default: 3}, // strength stat, for brute force
  mind: {type: Number, default: 3} // skill/int stat, for ropework and some other things
});

var BarsSchema = new Schema({
  mana: {type: Number, default: 100},
  stamina: {type: Number, default: 100},
  composure: {type: Number, default: 100},
  arousal: {type: Number, default: 0},
  willpower: {type: Number, default: 100}
});

var DamselSchema = new Schema({ // Create Schema
    _id: {type: String, required: true}, // ID of user on Discord
    name: {type: String, required: true}, // name of their current character
    pronouns: {type: String, required: true}, // pronouns, e.g. "she/her/her/hers", "he/him/his/his", "they/them/their/theirs"
    items: {
      type: Map,
      of: Number
    }, // E.g. {lockpicks: 5}, etc.
    cooldowns: {  // this is a map, so use .get() and .set()
      type: Map,  // Example: {struggle: Number}
      of: Number // numbers are Unix time and correspond to when the cooldown will expire
    },
    stats: {type: StatsSchema, required: true}, // base stats
    bars: {type: BarsSchema, required: true}, // secondary stats (stamina, arousal, mana, etc.)
    spells: {type: [SpellSchema], default: []},
    tokens: {type: Number, default: 0},
    shards: {type: Number, default: 0},
    xp: {type: Number, default: 0},
    //lewdzones: {type: LewdSchema, required: true}, // what areas can be 'lewded'
    bondage: {type: BondageSchema},
    toys: {type: ToysSchema},
    status: {type: [StatusSchema], default: []},
    blacklist: {type: [String], default: [], required: true}, // materials not to use, e.g. leather, latex, etc.
    registrationDate: {type: Number, default: (new Date()).getTime()} // unix time of damsel creation
});

// Model
var Damsels = mongoose.model("Damsels", DamselSchema); // Create collection model from schema
module.exports = Damsels; // export model
