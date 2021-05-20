const mongoose = require("mongoose"); // Import mongoose library
const Schema = mongoose.Schema; // Define Schema method

// Schema
var LewdSchema = newSchema({
    boobs: {type: Boolean, required: true},
    pussy: {type: Boolean, required: true},
    clit: {type: Boolean, required: true},
    butt: {type: Boolean, required: true},
    dick: {type: Boolean, required: true}
});

var BindingSchema = newSchema({
    type: {type: String, required: true}, // e.g. leather, rope, ribbon, etc.
    unlock: {type: Number, required: true}, // -1 means impossible, 0 is unlocked, 1+ means possible to unlock with lockpicks
    unclasp: {type: Number, required: true}, // difficulty to "undo" knots or buckles, etc.
    struggle: {type: Number, required: true}, // difficulty to wiggle free
    cut: {type: Number, required: true} // difficulty to cut through
});

var BondageSchema = newSchema({
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

var SpellSchema = newSchema({
    name: {type: String, required: true}, // name of the spell
    components: {type: String, required: true}, // body part required for casting, e.g. legs, arms, hands, etc.
    cost: {type: Number, required: true}, // stamina cost of the spell
    effect: {type: String, required: true} // effect of the spell, whether flavourful or otherwise
});

var StatusSchema = newSchema({
    name: {type: String, required: true}, // name of the status
    duration: {type: Number, required: true} // timestamp of when the status will end
});

var DamselSchema = new Schema({ // Create Schema
    _id: {type: String, required: true}, // ID of user on Discord
    name: {type: String, required: true}, // name of their current character
    pronouns: {type: String, required: true}, // pronouns, e.g. "she/her/her", "he/him/his", "they/them/their"
    items: {
      type: Map,
      of: Number
    }, // E.g. {lockpicks: 5}, etc.
    cooldowns: {  // this is a map, so use .get() and .set()
      type: Map,  // Example: {struggle: Number}
      of: Number // numbers are Unix time and correspond to when the cooldown will expire
    },
    stamina: {type: Number, default: 100}, // used to struggle, regenerates every so often
    staminaSet: {type: Number, default: -1}, // when stamina was last set (used to calculate current value)
    evasion: {type: Number, default: 3}, // evasion stat, for sneaky or precise things
    endurance: {type: Number, default: 3}, // endurance stat, for stamina stuff and other things
    spells: {type: [SpellSchema], default: []},
    tokens: {type: Number, default: 0},
    lewdzones: {type: LewdSchema, required: true},
    bondage: {type: BondageSchema},
    status: {type: [StatusSchema], default: []},
    blacklist: {type: [String], default: [], required: true}, // materials not to use, e.g. leather, latex, etc.
    registrationDate: {type: Number, default: (new Date()).getTime()} // unix time of damsel creation
});

// Model
var Damsels = mongoose.model("Damsels", DamselSchema); // Create collection model from schema
module.exports = Damsels; // export model
