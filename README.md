# basislijst-gebouwen
Tool om op basis van postcodes een lijst van gebouwidentificatoren te genereren (CSV on the Web-formaat)

## Install

```bash
npm install
```

## Run

```bash
node bin/postcode2gebouwen.js <postcode>
```

## Voorbeeld

```bash
node bin/postcode2gebouwen.js 9000
```

`9000.csv`:
```csv
"id","gebouwId","adresId","geografischeNaam","gebouweenheidId","straatnaam","huisnummer","longitude_lambert72","latitude_lambert72","gebouwEenheidStatus"
"0","http://data.vlaanderen.be/id/gebouw/9037008","http://data.vlaanderen.be/id/adres/200047","Fregatstraat 14, 9000 Gent","http://data.vlaanderen.be/id/gebouweenheid/9038228","Fregatstraat","14","104697.8","104697.8","Gerealiseerd"
"1","http://data.vlaanderen.be/id/gebouw/10542969","http://data.vlaanderen.be/id/adres/200068","Dendermondsesteenweg 53, 9000 Gent","http://data.vlaanderen.be/id/gebouweenheid/10544222","Dendermondsesteenweg","53","106169.69","106169.69","Gerealiseerd"
"2","http://data.vlaanderen.be/id/gebouw/10584805","http://data.vlaanderen.be/id/adres/200081","Belvédèreweg 183, 9000 Gent","http://data.vlaanderen.be/id/gebouweenheid/10587809","Belvédèreweg","183","102802.93","102802.93","Gerealiseerd"
```

`9000-metadata.json`:
```
{
	"@context": "http://www.w3.org/ns/csvw",
	"dc:title": "Gebouwenregister",
	"dc:description": "Gebouwenregister voor postcode(s) 9000",
	"dc:license": "https://creativecommons.org/publicdomain/zero/1.0/",
	"url": "9000.csv",
	"tableSchema": {
		"aboutUrl": "{gebouwId}",
		"columns": [{
			"titles": "id",
			"dc:description": "Rijnummer in de CSV."
		}, {
			"titles": "gebouwId",
			"dc:description": "Identificator (URI) van het gebouw.",
			"propertyUrl": ""
		}, {
			"titles": "adresId",
			"dc:description": "Identificator (URI) van het adres van het gebouw.",
			"propertyUrl": "https://data.vlaanderen.be/ns/gebouw#Gebouw.adres"
		}, {
			"titles": "geografischeNaam",
			"dc:description": "Geografische naam van het adres."
		}, {
			"titles": "gebouweenheidId",
			"dc:description": "Identificator (URI) van een gebouweenheid in het gebouw.",
			"propertyUrl": "https://data.vlaanderen.be/ns/gebouw#bestaatUit"
		}, {
			"titles": "straatnaam",
			"dc:description": "Straatnaam van het adres."
		}, {
			"titles": "huisnummer",
			"dc:description": "Huisnummer van het adres."
		}, {
			"titles": "longitude_lambert72",
			"datatype": "number",
			"dc:description": "Longitude van de puntlocatie van het adres.",
			"aboutUrl": "#geo"
		}, {
			"titles": "latitude_lambert72",
			"datatype": "number",
			"dc:description": "Latitude van de puntlocatie van het adres.",
			"aboutUrl": "#geo"
		}, {
			"titles": "gebouwEenheidStatus",
			"dc:description": "Status van de gebouweenheid."
		}, {
			"virtual": true,
			"propertyUrl": "rdf:type",
			"valueUrl": "https://data.vlaanderen.be/ns/gebouw#Gebouw"
		}, {
			"virtual": true,
			"aboutUrl": "{adresId}",
			"propertyUrl": "https://data.vlaanderen.be/ns/adres#positie",
			"valueUrl": "#geo"
		}, {
			"virtual": true,
			"aboutUrl": "#geo",
			"propertyUrl": "rdf:type",
			"valueUrl": "https://data.vlaanderen.be/ns/generiek#GeografischePositie"
		}, {
			"virtual": true,
			"aboutUrl": "{adresId}",
			"propertyUrl": "rdf:type",
			"valueUrl": "https://data.vlaanderen.be/ns/adres#Adres"
		}, {
			"virtual": true,
			"aboutUrl": "{adresId}",
			"propertyUrl": "https://data.vlaanderen.be/ns/adres#huisnummer",
			"valueUrl": "{huisnummer}"
		}, {
			"virtual": true,
			"aboutUrl": "{adresId}",
			"propertyUrl": "https://data.vlaanderen.be/ns/adres#heeftStraatnaam",
			"valueUrl": "#straatnaam"
		}, {
			"virtual": true,
			"aboutUrl": "#straatnaam",
			"propertyUrl": "http://www.w3.org/2000/01/rdf-schema#label",
			"valueUrl": "{straatnaam}"
		}]
	}
}
```