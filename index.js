const XLSX = require('xlsx');

var workbook = XLSX.readFile('Roomco-traductions.xlsx');

var sheet_name_list = workbook.SheetNames;

console.log(`Sheet Name = ${sheet_name_list}`);

var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

console.log(xlData);
