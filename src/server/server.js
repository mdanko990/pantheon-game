const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');

const PORT = process.env.PORT || 4001;
const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_eevfm1sY1Y9nBgzsE7uCHfL3P4HyRd93Q9MCYH3HTce6TV7WUfTnWlvIRCm7_vSCDUOGo5isu-gK/pub?output=tsv';

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

function csvJSON(csv, delimiter = "\t") {
  const lines = csv.replace(/\r/g, "").split("\n");
  const result = [];
  const headers = lines[0].split(delimiter);

  for (let i = 1; i < lines.length; i++) {        
    if (!lines[i])
      continue;
    const obj = {};
    const currentline = lines[i].split(delimiter);

    for (let j = 0; j < headers.length; j++)  
      obj[headers[j]] = isNumeric(currentline[j]) ? currentline[j] * 1 : currentline[j];

    result.push(obj);
  }
  return result;
}

app.get('/api/indexes', async function (req, res, next) {
  const date = req.query.date;
  const data = await axios.get(CSV_URL)
  .then(resp => resp.data);

  let jsonData = csvJSON(data);

  if(date){
    jsonData = jsonData.filter(el=>el['0']===date)[0];
  }

  res.status(200).json(jsonData);
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something is broken.');
});

app.use(function (req, res, next) {
  res.status(404).send('Sorry we could not find that.');
});


app.listen(PORT, function() {
  console.log(`Server is running on: ${PORT}`);
});