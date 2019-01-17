const csv = require('fast-csv'),
      fs = require('fs');

var Mapper = function (options) {
  this._options = options;
};

async function getAdresMatches(_postcode) {

}

async function getGebouweenheden(_adresObjectId) {

}

async function getGebouw(_gebouweenheidObjectId) {

}

async function getGebouwen(_postcode) {
  let gebouwen = [];

  const adressen = await getAdresMatches(_postcode);
  for (let i = 0; i < adressen.length; i++) {
    let straatnaam = adressen[i].volledigAdres.geografischeNaam.spelling.substring(0, adressen[i].volledigAdres.geografischeNaam.spelling.indexOf(' '));
    let huisnummer = adressen[i].huisnummer;
    let busnummer = adressen[i].busnummer;
    let adresId = adressen[i].identificator.id;
    console.log(straatnaam);

    let gebouweenheden = await getGebouweenheden(adressen[i].identificator.objectId);
    for (let j = 0; j < gebouweenheden.length; j++) {
      let gebouweenheid = await getGebouw(gebouweenheden[j].identificator.objectId);
      let gebouweenheidId = gebouweenheid.identificator.id;
      let gebouwId = gebouweenheid.gebouw.objectId;
      let gebouweenheidStatus = gebouweenheid.gebouweenheidStatus;
      let lat = gebouweenheid.geometriePunt.point.coordinates[0];
      let long = gebouweenheid.geometriePunt.point.coordinates[0];
      
      gebouwen.push({
        'gebouwId': gebouwId,
        'gebouweenheidId': gebouweenheidId
        'straatnaam': straatnaam,
        'huisnummer': huisnummer,
        'busnummer': busnummer
      })
    }
  }
  return gebouwen;
}

/**
* Returns a resultStream van gebouwen
* Step 1: 
*/
Mapper.prototype.resultStream = function (postcodes, done) {
  let parser = csv({ objectMode: true, headers: true });

  for (let i = 0; i < postcodes.length; i++) {
    const postcode = postcodes[i];
    let gebouwen = getGebouwen(postcode);
    for (let j = 0; j < gebouwen.length; j++) {
      parser.write(gebouwen[j]);
    }
    console.log(postcode);
  }
   parser.end();
};

module.exports = Mapper;