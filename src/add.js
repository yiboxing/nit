var fs = require('fs');
var chalk = require('chalk')
var querystring = require("querystring");

//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------
var sourceFilePath = null;
var sourceFileData = null;
var stagedFileData = null;
var diffList = []
var colorWhite = '\x1b[37m'
var colorGreen = '\x1b[32m'


//------------------------------------------------------------------------------
//  Start from here
//------------------------------------------------------------------------------

main();

//------------------------------------------------------------------------------
//  All the implementation goes below
//------------------------------------------------------------------------------

function main() {
  if (process.argv.length != 3) {
    console.log(chalk.white('nit add [filename]'))
    process.exit(1);
  }

  sourceFilePath = process.argv[2]; 

  // load source file data
  if (!fs.existsSync(sourceFilePath)) {
    console.log(chalk.white('Can\'t read ' + sourceFilePath));
  } else {
    var sourceFileAscii = fs.readFileSync(sourceFilePath, 'ascii');
    sourceFileData = querystring.escape(sourceFileAscii).split('%0A');
  }

  // create nit folder if there isn't any
  if (!fs.existsSync(process.cwd() + '/nit')){
      fs.mkdirSync(process.cwd() + '/nit');
  }

  // generate empty stage file if there isn't any
  if (!fs.existsSync(process.cwd() + '/nit/' + sourceFilePath + '.stage')) {
    fs.writeFileSync(process.cwd() + '/nit/' + sourceFilePath + '.stage', '')
    console.log(chalk.green('Adding new file \'' + sourceFilePath + '\' ...'));
  }

  // starting to generate diff
  var stagedFileCurrentAscii = fs.readFileSync(process.cwd() + '/nit/' + sourceFilePath + '.stage', 'ascii');
  stagedFileData = stagedFileCurrentAscii.split(',');

  // for demo purposes, only handle add case
  longData = sourceFileData;
  shortData = stagedFileData;

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

  // save to diff file
  //console.log(diffList)
  fs.writeFileSync(process.cwd() + '/nit/' + sourceFilePath + '.diff', JSON.stringify(diffList))
  console.log(chalk.green('Added \'' + sourceFilePath + '\''));
}


