const XLSX = require('xlsx');
const {createReadStream} = require('fs');
const {createInterface} = require('readline');
const replace = require('replace');
var stream = require('stream')



function setValueFromXslx(calback) {
  var workbook = XLSX.readFile('Roomco-traductions.xlsx');
  var sheet_name_list = workbook.SheetNames;
  var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  // console.log(`Sheet Name = ${sheet_name_list}`);

  // console.log(xlData);

  xlData.forEach((item, index, arrar) => {
    // console.log(`index == ${index} item == ${item}`);
    // console.log(`ID == ${item["ID"]} FR == ${item["FR"]} EN == ${item["EN"]}`);
    calback(item["ID"], item["FR"], '/Users/sdarcy/git/Medialice-Roomco-iOS/Roomco/ressources/fr.lproj/Localizable.strings');
  });
}

setValueFromXslx((id, value, inputFile) => {
  var instream = createReadStream(inputFile);
  var outstream = new stream();
  var rl = createInterface(instream, outstream);
  const commentRegex = require('comment-regex');

  // console.log(`setValueFromXslx:ID=${id} value=${value} inputFile=${inputFile}`);
  rl.on('line', (line) => {
    console.log(`line == ${line}`);
    if (!commentRegex().test(line)) {
      var array = line.trim().replace(';', '').split('=');
      if (array.length === 2) {

        let lineID = arrar[0].replace("\"", '');
        console.log(`->lineID == ${lineID} --> id = ${id}`);

        // let text = array[1].trim();
        // if (text.replace("\"", '').length > 1) {
        //   console.log(text);
        // }
      }
    }
  });

  rl.on('close', (line) => {
    if (!commentRegex().test(line) && typeof(line) === "string") {
      var array = line.trim().replace(';', '').split('=');
      if (array.length === 2) {

        let lineID = arrar[0].replace("\"", '');
        console.log(`->lineID == ${lineID} --> id = ${id}`);

        // let text = array[1].trim();
        // if (text.length > 1) {
        //   console.log(text);
        // }
      }
    }
    console.log('done reading file.');
  });
})

function processFile(inputFile) {
  var instream = createReadStream(inputFile);
  var outstream = new stream();
  var rl = createInterface(instream, outstream);

  const commentRegex = require('comment-regex');

  rl.on('line', (line) => {
    if (!commentRegex().test(line)) {
      var array = line.trim().replace(';', '').split('=');
      if (array.length === 2) {
        let text = array[1].trim();
        if (text.replace("\"", '').length > 1) {
          console.log(text);
        }
      }
    }
  });

  rl.on('close', (line) => {
    if (!commentRegex().test(line) && typeof(line) === "string") {
      var array = line.trim().replace(';', '').split('=');
      if (array.length === 2) {
        let text = array[1].trim();
        if (text.length > 1) {
          console.log(text);
        }
      }
    }
    // console.log(line);
    // console.log(commentRegex().test(line));
    console.log('done reading file.');
  });
}

// processFile('/Users/sdarcy/git/Medialice-Roomco-iOS/Roomco/fr.lproj/Main.strings');
// processFile('/Users/sdarcy/git/Medialice-Roomco-iOS/Roomco/ressources/fr.lproj/Localizable.strings');
