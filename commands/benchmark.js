const { performance } = require('perf_hooks');

module.exports = {
  name: 'benchmark', // The name of the command
  description: 'Tests benchmark stuff.', // The description of the command (for help text)
  args: false, // Specified that this command doesn't need any data other than the command
  perms: 'dev', //restricts to bot dev only (me)
  usage: '', // Help text to explain how to use the command (if it had any arguments)
  allowDM: true,
  async execute(message, args) {
    function createRandomJson(identifier) {
      let pokejson = {};
      pokejson.time = Math.random()*(10**10);
      pokejson.id = Math.ceil(Math.random()*1000);
      pokejson.shiny = Math.random()+0.05 > 1;
      pokejson.index = identifier;
      return pokejson;
    }

    const nameArray = [...Array(1000)].map(x=>Math.ceil(Math.random()*(10**10)).toString(32));

    const legendArray = [...Array(90)].map(x=>Math.ceil(Math.random()*1000));

    t0 = performance.now();

    for (var i = 0; i<100; i++) {
      const pokedata = [...Array(20000)].map((_,index) => createRandomJson(index));
      const sortedData = pokedata.sort((a,b)=>(a.time-b.time));
      const mappedData = pokedata.map((x)=>{
        let temp = x;
        temp.id = nameArray[temp.id-1];
        return temp;
      });
      const mappedData2 = pokedata.map((x)=>{
        let temp = x;
        temp.name = nameArray[temp.id-1];
        return temp;
      });
      const filteredData = pokedata.filter(a=>a.shiny);
      if ((0 == i % 5) && i != 0) {
        console.log("Loop "+i+" of 100.");
      }
    }
    t1 = performance.now();

    console.log("Array generated, sorted, mapped twice, and filtered 100 times after "+(t1-t0)+" ms for an average of "+((t1-t0)/100)+" ms");
  },
};
