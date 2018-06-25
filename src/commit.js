var fs = require('fs');
var chalk = require('chalk');
var request = require('request');
var neb = require('nebulas');

//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------
var keyFilePath = '/Users/sim/Projects/nit/wallet-files/n1ZiWK6RA3qKFKrhw9BhXGHQHB2KGD8pBM5.json'
var keyFileContent;
var diffStorageContractPath = '/Users/sim/Projects/nit/src/contracts/diff-storage-contract.js';
var diffStorageContractContent;
var nitFileData;
var diffFileContent;
var account;

//------------------------------------------------------------------------------
//  Start from here
//------------------------------------------------------------------------------

main();

//------------------------------------------------------------------------------
//  All the implementation goes below
//------------------------------------------------------------------------------

function main() {
  var commitMessage = process.argv[2];
  if (commitMessage == null || commitMessage == '') {
    console.log(chalk.red('commit message missing'));
    process.exit(1);
  }

  // load key file
  if (!fs.existsSync(keyFilePath)) {
    console.log(chalk.red('key file missing'));
    process.exit(1);
  } else {
    keyFileContent = fs.readFileSync(keyFilePath, 'ascii');
    account = neb.Account.NewAccount();
    account.fromKey(keyFileContent, '123456789')
  }

  // load nit file
  if (!fs.existsSync(process.cwd() + '/nit/.nit')) {
    console.log(chalk.red('project is not initialized'));
    process.exit(1);
  } else {
    nitFileData = JSON.parse(fs.readFileSync(process.cwd() + '/nit/.nit', 'ascii'));
    if (nitFileData.used_nonce == null) {
      nitFileData.used_nonce = nitFileData.deploy_nonce;
    }
  }

  // load diff file
  var fileName; // only handle one file
  var filesNames = fs.readdirSync(process.cwd());
  for (var i = 0; i < filesNames.length; i++) {
    if (!(filesNames[i] == 'nit')) {
      fileName = filesNames[i];
      break;
    }
  }
  if (!fs.existsSync(process.cwd() + '/nit/' + fileName + '.diff')) {
    console.log(chalk.red('Nothing to commit'));
    process.exit(1);
  } else {
    diffFileContent = fs.readFileSync(process.cwd() + '/nit/' + fileName + '.diff', 'ascii');
  }

  // load smart contract
  if (!fs.existsSync(diffStorageContractPath)) {
    console.log(chalk.red('diffStorageContractPath contract missing'));
    process.exit(1);
  } else {
    diffStorageContractContent = fs.readFileSync(diffStorageContractPath, 'ascii');
  }

  console.log(chalk.white('Generating diff file for commit: ' + commitMessage))
  var argString = "[\"" + diffFileContent.replace(/\"/g, '\\\"') + "\",\"" + commitMessage +  "\"]"

  // generage local transaction
  var diffStorageContract = {
    'source': diffStorageContractContent,
    'sourceType': 'js',
    'args': argString,
    'function': ''
  }
  var tx = new neb.Transaction({
     chainID: 1001,
     from: account,
     to: account.getAddressString(),
     value: 0,
     nonce: nitFileData.used_nonce + 1,
     gasPrice: 1000000,
     gasLimit: 2000000000,
     contract: diffStorageContract
  });

  tx.signTransaction();
  console.log(chalk.white(fileName + ' is signed to smart contract.'));

  // update nit file
  nitFileData.used_nonce = nitFileData.used_nonce + 1;
  if (nitFileData.localCommits == null) {
    nitFileData.localCommits = []
  }
  nitFileData.localCommits.push({
    message: commitMessage,
    rawTx: tx.toProtoString()
  })
  fs.writeFileSync(process.cwd() + '/nit/.nit', JSON.stringify(nitFileData))

  // apply diff file to stage file
  var stageFileAscii = fs.readFileSync(process.cwd() + '/nit/' + fileName + '.stage', 'ascii');
  var stageFileData = stageFileAscii.split(',');

  diffList = JSON.parse(diffFileContent);

  if (diffList.length != 0) {
    for (i = 0; i < diffList.length; i++) {
      stageFileData.splice(diffList[i].pos, 0, diffList[i].data);
    }
  }

  stageFileAscii = ''
  for (i = 0; i < stageFileData.length; i++) {
    stageFileAscii = stageFileAscii + stageFileData[i]
    if ( i != stageFileData.length - 1) {
      stageFileAscii = stageFileAscii + ','
    }
  }
  fs.writeFileSync(process.cwd() + '/nit/' + fileName + '.stage', stageFileAscii)

  // remove .diff file
  fs.unlinkSync(process.cwd() + '/nit/' + fileName + '.diff')
}



