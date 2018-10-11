const XLSX = require('xlsx');
const {createReadStream} = require('fs');
const {createInterface} = require('readline');
const replace = require('replace');
const fs = require('fs');
var stream = require('stream');
var program = require('commander');
var sleep = require('sleep');
const replaceInFile = require('replace-in-file');

var linesAppands = [];

// var inputFile = '/Users/sdarcy/git/Medialice-Roomco-iOS/Roomco/ressources/fr.lproj/Localizable.strings';
// var xlTranslateFile = 'Roomco-traductions.xlsx';

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
  msleep(n*1000);
}

async function replaceLineInFile(file, newLine, oldLine) {

  const options = {
    files: file,
    from: oldLine,
    to: newLine,
  };

  try {
    console.log(`newline===${newLine}===`);
    const changes = replaceInFile.sync(options);
    console.log('Modified files:', changes.join(', '));
  }
  catch (error) {
    console.error('Error occurred:', error);
  }
}

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

function storyboardTranslateHandler(inputFile, line, xlTranslateFile, key, baseLanguage, language) {
  const commentRegex = require('comment-regex');
  var workbook = XLSX.readFile(xlTranslateFile);
  var sheet_name_list = workbook.SheetNames;
  var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  if (!commentRegex().test(line)) {
    var tmpLine = line
    line = line.trim();
    if (line.length > 0) {
      var array = line.trim().replace(';', '').split('=');
      if (array.length === 2) {
        var lineID = array[0].replace("\"", '');
        var value = array[1].replace("\"", '');
        lineID = lineID.replace("\"", '');
        value = value.replace("\"", '');
        xlData.forEach((item, index, array) => {
          if (value.trim() === item[baseLanguage].trim()) {
            // console.log(`line===${line}===`);
            var newLine = `\"${lineID.trim()}\" = \"${item[language].trim()}\";`;
            newLine = newLine.replace('%1$d', '%d');
            newLine = newLine.replace('%1$s', '%@');
            replaceLineInFile(inputFile, newLine, tmpLine);
          }
        })
      }
    }
  }
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
            console.log(`language == ${language}`);
            console.log('item == %j', item);
            var newLine = `\"${lineID.trim()}\" = \"${item[language].trim()}\";`;
            newLine = newLine.replace('%1$d', '%d');
            newLine = newLine.replace('%1$s', '%@')
            console.log(`newline===${newLine}===`);
            replaceLineInFile(inputFile, newLine, line);
          } else {
            let content = fs.readFileSync(inputFile, 'utf8');
            if (!content.toString().includes(item[key].trim())) {
              console.log('============>>');
              console.log(`language == ${language}`);
              console.log('item == %j', item);
              if (typeof(item[language]) !== "undefined") {
                var newLine = `\"${item[key].trim()}\" = \"${item[language].trim()}\";`
                newLine = newLine.replace('%1$d', '%d');
                newLine = newLine.replace('%1$s', '%@')
                if (linesAppands.indexOf(newLine) === -1) {
                  console.log(`notFoundLine===${newLine}===`);
                  linesAppands.push(newLine);
                  fs.appendFile(inputFile, newLine+"\n", function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                  });
                }
              }
            }
          }
        });
      }
    }
  }
}

function run() {

  function list(val) {
    return val.split(',');
  }
program
  .usage('[options] <file ...>')
  .option('-x, --xl <xl file>', 'An XL file containt translations text')
  .option('-k, --key <key ID>', 'A row title in XL file using to get translation keys')
  .option('-l, --language <Ex: FR>', 'language international unicode')
  .option('-f, --files <files>', 'A list of files to translate', list)
  .option('-b, --baseLanguage <Ex: EN>', 'Reference language international unicode', list)
  .parse(process.argv);

  console.log(' xl file: %j', program.xl);
  console.log(' key ID: %j', program.key);
  console.log(' language: %j', program.language);
  console.log(' files: %j', program.files);
  console.log(' baseLanguage: %j', program.baseLanguage);
  console.log(' args: %j', program.args);

  if (!program.hasOwnProperty("xl") || !program.hasOwnProperty("key")
    || !program.hasOwnProperty("language") || !program.hasOwnProperty("files")) {
    return console.log('missing parameters: Use --help to show options');
  }

  program.files.forEach((file, index, array) => {
    if (program.hasOwnProperty("baseLanguage")) {
      setValueFromXslx(file, program.xl, program.key, program.language, program.baseLanguage, storyboardTranslateHandler);
    } else {
      setValueFromXslx(file, program.xl, program.key, program.language, translationHandler);
    }

  });
}

run();

// processFile('/Users/sdarcy/git/Medialice-Roomco-iOS/Roomco/fr.lproj/Main.strings');
// processFile('/Users/sdarcy/git/Medialice-Roomco-iOS/Roomco/ressources/fr.lproj/Localizable.strings');
