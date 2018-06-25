var fs = require('fs');
var querystring = require("querystring");
var chalk = require('chalk')

//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------
var sourceFilePath = null;
var sourceFileData = null;
var historyFileData = null;
var diffList = []

//------------------------------------------------------------------------------
//  Start from here
//------------------------------------------------------------------------------

main();

//------------------------------------------------------------------------------
//  All the implementation goes below
//------------------------------------------------------------------------------

function main() {
    //console.log(process.argv.length)
  if (process.argv.length != 3) {
    console.log('nit diff [filename]')
    process.exit(1);
  }

  sourceFilePath = process.argv[2]; 

  if (!fs.existsSync(process.cwd() + '/' + sourceFilePath)) {
    console.log('Can\'t read ' + sourceFilePath);
  } else {
    var sourceFileAscii = fs.readFileSync(process.cwd() + '/' + sourceFilePath, 'ascii');
    sourceFileData = querystring.escape(sourceFileAscii).split('%0A');
  }
  //console.log(sourceFileData);

  if (fs.existsSync(process.cwd() + '/nit/' + sourceFilePath + '.stage')) {
    // have a history
    var historyFileAscii = fs.readFileSync(process.cwd() + '/nit/' + sourceFilePath + '.stage', 'ascii');
    historyFileData = historyFileAscii.split(',');
  } else {
    // don't have a history
    historyFileData = []
  }

  // if (sourceFileData.length > historyFileData.length) {
  //   //console.log('lines added!')
  // } else if (sourceFileData.length < historyFileData.length) {
  //   console.log('lines deleted!')
  // } else {
  //   console.log('lines equal')
  // }
  // console.log(sourceFileData)
  // console.log(historyFileData)

  longData = sourceFileData;
  shortData = historyFileData;

  lp = 0;
  sp = 0;

  while (lp < longData.length && sp < shortData.length) {
    if (longData[lp] == shortData[sp])
    {
      lp += 1;
      sp += 1;
    } else {
      // diff found
      diffList.push({'pos': lp.toString(), 'data': longData[lp]});
      lp += 1;
    }
  }

  if (sp == shortData.length) {
    while (lp < longData.length) {
      diffList.push({'pos': lp.toString(), 'data': longData[lp]});
      lp += 1;
    }
  }

  if (diffList.length != 0) {
    console.log(chalk.white('Diffing ' + sourceFilePath + ':'))
    //shortDataDuplicate = shortData;
    for (i = 0; i < diffList.length; i++) {
      console.log(chalk.green('line: ' + diffList[i].pos.toString() + ' +      ' + decodeURIComponent(diffList[i].data)));
      //console.log(chalk.green())
      //shortDataDuplicate.splice(diffList[i].pos, 0, diffList[i].data);
    }
  } else {
    console.log(chalk.white('File ' + sourceFilePath + ' is up to date.'))
  }
}
