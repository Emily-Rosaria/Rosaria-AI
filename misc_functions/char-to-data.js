
module.exports = async function(sheet) {
  let data = {};
  let fields = {
    "name":["name"],
    "age":["age"],
    "gender":["gender","sex"],
    "sexuality":["sexuality","orientation"],
    "appearance":["appearance","looks"],
    "personality":["personality"],
    "kinks":["kinks","turn-ons","turn ons","turnons"],
    "blacklist":["blacklist","turn-offs","turn offs","turnoffs"],
    "backstory":["backstory","bio"],
    "role":["role"]
  };
  const all_fields = Object.keys(fields).map(f=>fields[f]).flat();
  const re = new RegExp(`(${all_fields.join('|')}) *: *([^:]*)(?!.*:)`, 'gi');
  const matches = sheet.match(re);
  for (const match of matches) {
    const fieldValue = match.split(':');
    const field = Object.keys(fields).filter(f=>fields[f].includes(fieldValue[0].toLowerCase().trim()));
    if (field && field[0]) {
      if (!data[field]) {
        data[field] = fieldValue[1].trim();
      }
    }
  }
  return data;
};
