var program = require('commander'),
    postcode2gebouwen = require('../lib/postcode2gebouwen.js'),
    //gebouw2JSONLD = require('../lib/Gebouw2JSONLD.js'),
    fs = require('fs');

//ty http://www.geedew.com/remove-a-directory-that-is-not-empty-in-nodejs/
/*var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};*/

console.error("Postcodes naar gebouwen basislijst Gebruik --help om meer functies te ontdekken");

program
  .option('-f, --format <format>', 'Format of the output. Possibilities: csv (default: csv)')
  .arguments('<postcodes>', 'Oplijsting van postcodes met komma aan elkaar geschreven (bv.: 9000,8000')
  .action(function (postcodes) {
    // TODO: split postcodes in array, currently only one postcode supported
    program.postcodes = [ postcodes ]; // array with one postcode
  })
  .parse(process.argv);

if (!program.postcodes) {
  console.error('Gelieve één of meer postcodes op te lijsten');
  process.exit();
}

var mapper = new postcode2gebouwen();

var resultStream = null;
mapper.resultStream(program.postcodes, function (stream) {
  resultStream = stream;
  if (program.format === 'csv') {
    //print header
    console.error('This CSV will have JSON-LD accompanied in the future, supporting CSV on the Web');
    console.log('"id","gebouwId","gebouwEenheidId","straatnaam","huisnummer","busnummer","longitude","latitude","gebouwEenheidStatus"');
    var count = 0;
    
    stream.on('data', function (gebouw) {
      console.log(count + ',' + gebouw["gebouwId"] + ',' + gebouw["straatnaam"] + ',' +  gebouw["huisnummer"] + gebouw["busnummer"] + '"');
      count ++;
    });
  } 
  stream.on('error', error => {
    console.error(error);
  });
  stream.on('finish', function () {
    console.error('Stream ended - everything should be fully converted!');
  });
});

process.on('SIGINT', function () {
  console.error("\nSIGINT Received – Cleaning up");
  if (resultStream) {
    resultStream.end();
  }
  process.exit(0);
});
