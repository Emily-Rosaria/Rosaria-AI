// takes milliseconds and turns it to a readable string duration

module.exports = function ( ms ) {
  const seconds = ms/1000;

  if (seconds < 1) {return "less than one second"}
  var timeArray = [
      [Math.floor(seconds / 31536000), 'year'],
      [Math.floor((seconds % 31536000) / 86400), 'day'],
      [Math.floor(((seconds % 31536000) % 86400) / 3600), 'hour'],
      [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'minute'],
      [Math.floor(((seconds % 31536000) % 86400) % 3600) % 60, 'second'],
  ];
  timeArray = timeArray.filter(t=>t[0]!=0).map((t,i,a)=> {
    let temp = t[0].toString()+' '+t[1];
    if (i == a.length - 1 && a.length > 1) {temp = 'and '+temp}
    if (t[0]!=1) {temp = temp+'s'}
    return temp;
  });
  if (timeArray.length == 2) {return timeArray.join(' ').trim()}
  else {return timeArray.join(', ').trim()}
}
