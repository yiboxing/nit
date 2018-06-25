var fs = require('fs');
var querystring = require("querystring");
var chalk = require('chalk')


//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
//  Start from here
//------------------------------------------------------------------------------

main();

//------------------------------------------------------------------------------
//  All the implementation goes below
//------------------------------------------------------------------------------

function main() {
  // create nit folder if there isn't any
  if (!fs.existsSync(process.cwd() + '/nit')){
    console.log(chalk.yellow('Directory is not a nit repository.'))
    console.log(chalk.white('run "nit init"'));
  }

  var filesNames = fs.readdirSync(process.cwd());
  for (var i = 0; i < filesNames.length; i++) {
    if (!(filesNames[i] == 'nit')) {
      var fileName = filesNames[i];
      //console.log('checking ' + fileName)
      if (!fs.existsSync('./nit/' + fileName + '.stage')) {
        // new file
        console.log(chalk.white('New File:  ' + filesNames[i]))
      } else {
        // check diff file
        if (fs.existsSync('./nit/' + fileName + '.diff')) {
          // staged file
          console.log(chalk.yellow('Staged File:  ' + fileName))
        } else {
          // not staged or no difference
          console.log(chalk.white('Project is up to date.'))
        }
      } 
    }
  }
}


