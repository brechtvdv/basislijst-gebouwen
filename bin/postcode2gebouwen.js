var program = require('commander'),
    postcode2gebouwen = require('../lib/postcode2gebouwen.js'),
    fs = require('fs');

console.error("Postcodes naar gebouwen basislijst Gebruik --help om meer functies te ontdekken");

program
  .arguments('<postcodes>', 'Oplijsting van postcodes met komma aan elkaar geschreven (bv.: 9000,8000')
  .action(function (postcodes) {
    program.filename = postcodes;
    // TODO: split postcodes in array, currently only one postcode supported
    program.postcodes = [ postcodes ]; // array with one postcode
  })
  .parse(process.argv);

if (!program.postcodes) {
  console.error('Gelieve één of meer postcodes op te lijsten');
  process.exit();
}

var mapper = new postcode2gebouwen();

(async () => {
  const csv = fs.createWriteStream(`${program.filename}.csv`);
  const mdjson = fs.createWriteStream(`${program.filename}-metadata.json`);

  // metadata
  let metadata = {
    "@context": "http://www.w3.org/ns/csvw",
    "dc:title": "Gebouwenregister",
    "dc:description": "Gebouwenregister voor postcode(s) " + program.postcodes,
    "dc:license": "https://creativecommons.org/publicdomain/zero/1.0/",
    "url": program.filename + ".csv",
    "tableSchema": {
      "aboutUrl": "{gebouwId}",
      "columns": [{
        "titles": "id",
        "dc:description": "Rijnummer in de CSV."
      },{
        "titles": "gebouwId",
        "dc:description": "Identificator (URI) van het gebouw.",
        "propertyUrl": ""
      },{
        "titles": "adresId",
        "dc:description": "Identificator (URI) van het adres van het gebouw.",
        "propertyUrl": "https://data.vlaanderen.be/ns/gebouw#Gebouw.adres"
      },{
        "titles": "geografischeNaam",
        "dc:description": "Geografische naam van het adres."
      },{
        "titles": "gebouweenheidId",
        "dc:description": "Identificator (URI) van een gebouweenheid in het gebouw.",
        "propertyUrl": "https://data.vlaanderen.be/ns/gebouw#bestaatUit"
      },{
        "titles": "straatnaam",
        "dc:description": "Straatnaam van het adres."
      },{
        "titles": "huisnummer",
        "dc:description": "Huisnummer van het adres."
      },{
        "titles": "longitude_lambert72",
        "datatype": "number",
        "dc:description": "Longitude van de puntlocatie van het adres.",
        "aboutUrl": "#geo",
      },{
        "titles": "latitude_lambert72",
        "datatype": "number",
        "dc:description": "Latitude van de puntlocatie van het adres.",
        "aboutUrl": "#geo",
      },{
        "titles": "gebouwEenheidStatus",
        "dc:description": "Status van de gebouweenheid."
      },{
        "virtual": true,
        "propertyUrl": "rdf:type",
        "valueUrl": "https://data.vlaanderen.be/ns/gebouw#Gebouw"
      },{
        "virtual": true,
        "aboutUrl": "{adresId}",
        "propertyUrl": "https://data.vlaanderen.be/ns/adres#positie",
        "valueUrl": "#geo"
      },{
        "virtual": true,
        "aboutUrl": "#geo",
        "propertyUrl": "rdf:type",
        "valueUrl": "https://data.vlaanderen.be/ns/generiek#GeografischePositie"
      },
      {
        "virtual": true,
        "aboutUrl": "{adresId}",
        "propertyUrl": "rdf:type",
        "valueUrl": "https://data.vlaanderen.be/ns/adres#Adres"
      },
      {
        "virtual": true,
        "aboutUrl": "{adresId}",
        "propertyUrl": "https://data.vlaanderen.be/ns/adres#huisnummer",
        "valueUrl": "{huisnummer}"
      },
      {
        "virtual": true,
        "aboutUrl": "{adresId}",
        "propertyUrl": "https://data.vlaanderen.be/ns/adres#heeftStraatnaam",
        "valueUrl": "#straatnaam"
      },{
        "virtual": true,
        "aboutUrl": "#straatnaam",
        "propertyUrl": "http://www.w3.org/2000/01/rdf-schema#label",
        "valueUrl": "{straatnaam}"
      }]
    }
  };

  mdjson.write(JSON.stringify(metadata));
  mdjson.end();

   //csv
  console.error('This CSV will have JSON-LD accompanied in the future, supporting CSV on the Web');

  const header = '"id","gebouwId","adresId","geografischeNaam","gebouweenheidId","straatnaam","huisnummer","longitude_lambert72","latitude_lambert72","gebouwEenheidStatus"';
  csv.write(header+"\n");
  console.log(header);

  let count = 0;
  for await (let gebouw of mapper.getGebouwen(program.postcodes)) {
    let row = `"${count}","${gebouw['gebouwId']}","${gebouw['adresId']}","${gebouw['geografischeNaam']}","${gebouw['gebouweenheidId']}","${gebouw['straatnaam']}","${gebouw['huisnummer']}","${gebouw['longitude_lambert72']}","${gebouw['latitude_lambert72']}","${gebouw['gebouweenheidStatus']}"`;
    csv.write(row+"\n");
    console.log(row);
    count++;
  }
  csv.end();
})();
