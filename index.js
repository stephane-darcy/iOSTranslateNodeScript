const XLSX = require('xlsx');
const {createReadStream} = require('fs');
const {createInterface} = require('readline');
const replace = require('replace');
const fs = require('fs');
var stream = require('stream');
var program = require('commander');


// var inputFile = '/Users/sdarcy/git/Medialice-Roomco-iOS/Roomco/ressources/fr.lproj/Localizable.strings';
// var xlTranslateFile = 'Roomco-traductions.xlsx';

function setValueFromXslx(inputFile, xlTranslateFile, key, language, calback) {

  var ressources = {};

  var instream = createReadStream(inputFile);
  var outstream = new stream();
  var rl = createInterface(instream, outstream);

  rl.on('line', (line) => {
    calback(inputFile, line, xlTranslateFile, key, language);
  });

  rl.on('close', (line) => {
    console.log(`line = ${line}`);
    console.log('done reading file.');
  });


}


function translationHandler(inputFile, line, xlTranslateFile, key, language) {
  const commentRegex = require('comment-regex');
  // var workbook = XLSX.readFile('Roomco-traductions.xlsx');
  var workbook = XLSX.readFile(xlTranslateFile);
  var sheet_name_list = workbook.SheetNames;
  var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  if (!commentRegex().test(line)) {
    line = line.trim();
    if (line.length > 0) {
      var array = line.trim().replace(';', '').split('=');
      if (array.length === 2) {
        var lineID = array[0].replace("\"", '');
        var value = array[1].replace("\"", '');
        lineID = lineID.replace("\"", '');
        value = value.replace("\"", '');
        xlData.forEach((item, index, arrar) => {
          if (lineID.trim() === item[key].trim()) {
            console.log(`line===${line}===`);
            console.log(`->lineID == ${lineID} --> id = ${item[key]}`);
            var newLine = `\"${lineID.trim()}\" = \"${item[language].trim()}\";`;
            newLine = newLine.replace('%1$d', '%d');
            newLine = newLine.replace('%1$s', '%@')
            console.log(`newline===${newLine}===`);
            fs.readFile(inputFile, 'utf8', function (err,data) {
            if (err) {
              return console.log(err);
            }
            var result = data.replace(line, newLine);

            // fs.writeFile(someFile, result, 'utf8', function (err) {
            //    if (err) return console.log(err);
            // });
            });
          }
        });
      }
    }
  }
}


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

// setValueFromXslx(inputFile, translationHandler);

function run() {

  function list(val) {
    return val.split(',');
  }
program
  .usage('[options] <file ...>')
  .option('-x, --xl <xl file>', 'An XL file containt translations text')
  .option('-k, --key <key ID>', 'A row title in XL file using to get translation keys')
  .option('-l, --language <language international uni code>', 'A range')
  .option('-f, --files <files>', 'A list of files to translate', list)
  .parse(process.argv);

  console.log(' xl file: %j', program.xl);
  console.log(' key ID: %j', program.key);
  console.log(' language: %j', program.language);
  console.log(' files: %j', program.files);
  console.log(' args: %j', program.args);

  if (!program.hasOwnProperty("xl") || !program.hasOwnProperty("key")
    || !program.hasOwnProperty("language") || !program.hasOwnProperty("files")) {
    return console.log('missing parameters: Use --help to show options');
  }

  program.files.forEach((file, index, array) => {
    setValueFromXslx(file, program.xl, program.key, program.language, translationHandler);
  });
}

run();

// processFile('/Users/sdarcy/git/Medialice-Roomco-iOS/Roomco/fr.lproj/Main.strings');
// processFile('/Users/sdarcy/git/Medialice-Roomco-iOS/Roomco/ressources/fr.lproj/Localizable.strings');
