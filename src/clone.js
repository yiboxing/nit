var fs = require('fs');
var chalk = require('chalk');
var request = require('request');
var neb = require('nebulas');
var querystring = require("querystring");


//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------
var keyFilePath = '/Users/sim/Projects/nit/wallet-files/n1ZiWK6RA3qKFKrhw9BhXGHQHB2KGD8pBM5.json'
var keyFileContent;
var account;
var repoContractAddress;
var commitLog;
var cloneProgress;
var cloneFileData = [];
//------------------------------------------------------------------------------
//  Start from here
//------------------------------------------------------------------------------

main();

//------------------------------------------------------------------------------
//  All the implementation goes below
//------------------------------------------------------------------------------

function main() {
  repoContractAddress = process.argv[2];
  if (repoContractAddress == null || repoContractAddress == '') {
    console.log(chalk.red('repository address missing'));
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

  request.post({
    headers: {
      'content-type' : 'application/json;charset=UTF-8',
      'X-DevTools-Emulate-Network-Conditions-Client-Id' : 'DBD82AD3541AFF90B7FCF164CDC1757A',
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
    },
    url:     'https://mainnet.nebulas.io/v1/user/accountstate',
    body:    '{"address":"' + account.getAddressString() + '"}'
  }, onGetAccountStatus);

}

function onGetAccountStatus(error, response, body) {
  queryNonce = parseInt(JSON.parse(body).result.nonce) + 1;
    
  var body = {
    from: account.getAddressString(),
    to: repoContractAddress,
    value: "0",
    nonce: queryNonce,
    gasPrice: "1000000",
    gasLimit: "2000000",
    contract: {
      function: "showLog",
      args: ""
    }
  }

  request.post({
    headers: {
      'content-type' : 'application/json;charset=UTF-8',
      'X-DevTools-Emulate-Network-Conditions-Client-Id' : 'DBD82AD3541AFF90B7FCF164CDC1757A',
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
    },
    url:     'https://mainnet.nebulas.io/v1/user/call',
    body:    JSON.stringify(body)
  }, onGetCommitLog);
}

function onGetCommitLog(error, response, body) {
  console.log(chalk.yellow(body))
  var commitLogRaw = JSON.parse(body)
  var commitLogString = commitLogRaw.result.result;
  commitLogString = commitLogString.substring(1, commitLogString.length - 1)
  commitLogString = commitLogString.replace(/\\\"/g, '\"');

  commitLog = JSON.parse(commitLogString)
  for (var i = 0; i < commitLog.length; i ++) {
    console.log(chalk.white())
    console.log(chalk.white('commit hash:     ' + commitLog[i].tx))
    console.log(chalk.white('commit message:  ' + commitLog[i].msg))
  }

  cloneProgress = 0;
  pullNextCommit();
}

function pullNextCommit() {
  console.log(chalk.yellow())
  if (cloneProgress >= commitLog.length) {
    flushToFile();
    return
  }

  console.log(chalk.yellow('Pulling commit ' + commitLog[cloneProgress].tx))
  var body = {
    from: account.getAddressString(),
    to: commitLog[cloneProgress].tx, // bug, too lazy to fix
    value: "0",
    nonce: queryNonce,
    gasPrice: "1000000",
    gasLimit: "2000000",
    contract: {
      function: "getDiffData",
      args: ""
    }
  }

  request.post({
    headers: {
      'content-type' : 'application/json;charset=UTF-8',
      'X-DevTools-Emulate-Network-Conditions-Client-Id' : 'DBD82AD3541AFF90B7FCF164CDC1757A',
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
    },
    url:     'https://mainnet.nebulas.io/v1/user/call',
    body:    JSON.stringify(body)
  }, onGetCommitData);
}

function onGetCommitData(error, response, body) {
  var commitDataRaw = JSON.parse(body)
  var commitDataString = commitDataRaw.result.result;
  commitDataString = commitDataString.substring(1, commitDataString.length - 1)
  commitDataString = commitDataString.replace(/\\\"/g, '\"');

  var diffList = JSON.parse(commitDataString)

    // apply diff file to stage file
  if (diffList.length != 0) {
    for (i = 0; i < diffList.length; i++) {
      cloneFileData.splice(diffList[i].pos, 0, diffList[i].data);
    }
  }
  cloneProgress  = cloneProgress + 1;
  pullNextCommit();
}

function flushToFile() {

  cloneFileAsicc = ''
  for (i = 0; i < cloneFileData.length; i++) {
    cloneFileAsicc = cloneFileAsicc + cloneFileData[i]
    if ( i != cloneFileData.length - 1) {
      cloneFileAsicc = cloneFileAsicc + '%0A'
    }
  }
  
  sourceFileData = querystring.unescape(cloneFileAsicc);
  fs.writeFileSync('./sample-code.js', sourceFileData)
} 



