const csv = require('fast-csv'),
      fs = require('fs'),
      https = require('https'),
      request = require('requestretry');


var Mapper = function (options) {
  this._options = options;
};

async function* getAdresMatches(_postcode) {
  let url = `https://basisregisters.vlaanderen.be/api/v1/adressen?listAdresRequest.postcode=${_postcode}`;
  let response = await fetch(url);
  while (url) {
    for (let i = 0; i < response.adressen.length; i++) {
      yield response.adressen[i];
    }
    url = response.volgende;
  }
}

async function* getGebouweenhedenAtaddress(_adresObjectId) {
  let url = `https://basisregisters.vlaanderen.be/api/v1/gebouweenheden?request.adresObjectId=${_adresObjectId}`;
  while (url) {
    let response = await fetch(url);
    for (let i = 0; i < response.gebouweenheden.length; i++) {
      yield response.gebouweenheden[i].identificator.objectId;
    }
    url = response.volgende;
  }
}

async function getGebouweenheid(_gebouweenheidObjectId) {
  return await fetch(`https://basisregisters.vlaanderen.be/api/v1/gebouweenheden/{ObjectId}?objectid=${_gebouweenheidObjectId}`);
}

Mapper.prototype.getGebouwen = async function* (_postcode) {
  for await (let adres of getAdresMatches(_postcode)) {
    let straatnaam = adres.volledigAdres.geografischeNaam.spelling.substring(0, adres.volledigAdres.geografischeNaam.spelling.indexOf(' '));
    let huisnummer = adres.huisnummer;
    let busnummer = adres.busnummer;
    let geografischeNaam = adres.volledigAdres.geografischeNaam.spelling;
    let adresObjectId = adres.identificator.objectId;
    let adresId = 'http://data.vlaanderen.be/id/adres/' + adresObjectId;

    for await (let gebouweenheidObjectId of getGebouweenhedenAtaddress(adresObjectId)) {
      let gebouweenheid = await getGebouweenheid(gebouweenheidObjectId);
      let gebouweenheidId = gebouweenheid.identificator.id;
      let gebouwId = 'http://data.vlaanderen.be/id/gebouw/' + gebouweenheid.gebouw.objectId;
      let gebouweenheidStatus = gebouweenheid.gebouweenheidStatus;
      let latitude_lambert72 = gebouweenheid.geometriePunt.point.coordinates[0];
      let longitude_lambert72 = gebouweenheid.geometriePunt.point.coordinates[0];
        
      yield {
        'gebouwId': gebouwId,
        'adresId': adresId,
        'geografischeNaam': geografischeNaam,
        'gebouweenheidId': gebouweenheidId,
        'straatnaam': straatnaam,
        'huisnummer': huisnummer,
        'busnummer': busnummer,
        'longitude_lambert72': longitude_lambert72,
        'latitude_lambert72': latitude_lambert72,
        'gebouweenheidStatus': gebouweenheidStatus
      };
    }
  }
}


function fetch(_url) {
  return new Promise(resolve => {
    request({
      url: _url,
      json: true,
   
        // The below parameters are specific to request-retry
        maxAttempts: 5,   // (default) try 5 times
        retryDelay: 5000,  // (default) wait for 5s before trying again
        retryStrategy: request.RetryStrategies.HTTPOrNetworkError // (default) retry on 5xx or network errors
      }, function(err, response, body){
        // this callback will only be called when the request succeeded or after maxAttempts or on error
        if (response) {
          //console.log('The number of request attempts: ' + response.attempts);
          resolve(response.body);
        }
    });
  });
}

module.exports = Mapper;