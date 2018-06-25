var fs = require('fs');
var chalk = require('chalk');
var request = require('request');
var neb = require('nebulas');

//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------
var keyFilePath = '/Users/sim/Projects/nit/wallet-files/n1ZiWK6RA3qKFKrhw9BhXGHQHB2KGD8pBM5.json'
var keyFileContent;
var account;
var repoContractPath = '/Users/sim/Projects/nit/src/contracts/repo-contract.js';
var repoContractContent;
var nitFileData;
var commitLog = []
var pushProgress = 0;


//------------------------------------------------------------------------------
//  Start from here
//------------------------------------------------------------------------------

main();

//------------------------------------------------------------------------------
//  All the implementation goes below
//------------------------------------------------------------------------------

function main() {
  // load smart contract
  if (!fs.existsSync(repoContractPath)) {
    console.log(chalk.red('Smart contract missing'));
    process.exit(1);
  } else {
    repoContractContent = fs.readFileSync(repoContractPath, 'ascii');
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
    //nitFileData.used_nonce
  }

  pushProgress = 0;
  pushCommit();
}

function pushCommit() {
  if (pushProgress >= nitFileData.localCommits.length) {
    registerCommits();
  } else {
    // deploy contract
    console.log(chalk.white(''));
    console.log(chalk.white('Pushing commit:  ' + nitFileData.localCommits[pushProgress].message));
    request.post({
      headers: {
        'content-type' : 'application/json;charset=UTF-8',
        'X-DevTools-Emulate-Network-Conditions-Client-Id' : 'DBD82AD3541AFF90B7FCF164CDC1757A',
        'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
      },
      url:     'https://testnet.nebulas.io/v1/user/rawtransaction',
      body:    '{"data":"' + nitFileData.localCommits[pushProgress].rawTx + '"}'
    }, pushCommitCallback);
  }
}

function pushCommitCallback(err, response, body) {
  console.log(chalk.yellow(body));

  // save in commit log
  commitLog.push({
    "txHash": JSON.parse(body).result.contract_address, // bug, too lazy to fix
    "message": nitFileData.localCommits[pushProgress].message
  })
  // increase progress and continue
  pushProgress = pushProgress + 1;
  pushCommit();
}

function registerCommits() {
  console.log('Registering commits onto repo contract:')
  console.log(chalk.white(JSON.stringify(commitLog)))
  // generage local transaction
  var flatCommitLog = "[\"" + JSON.stringify(commitLog).replace(/\"/g, '\\\"') + "\"]"

  var contractCall = {
    'function': 'commit',
    'args': flatCommitLog
  }
  var tx = new neb.Transaction({
     chainID: 1001,
     from: account,
     to: nitFileData.repo_address,
     value: 0,
     nonce: nitFileData.used_nonce + 1,
     gasPrice: 1000000,
     gasLimit: 2000000000,
     contract: contractCall
  });

  tx.signTransaction();
  request.post({
    headers: {
      'content-type' : 'application/json;charset=UTF-8',
      'X-DevTools-Emulate-Network-Conditions-Client-Id' : 'DBD82AD3541AFF90B7FCF164CDC1757A',
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
    },
    url:     'https://testnet.nebulas.io/v1/user/rawtransaction',
    body:    '{"data":"' + tx.toProtoString() + '"}'
  }, registerCommitCallback);
}

function registerCommitCallback(error, response, body) {
  console.log(chalk.yellow(body));
  console.log(chalk.white('-----------------------  ------------------------------------'))
  console.log(chalk.white('|                                                           |'))
  console.log(chalk.white('| Pushing to repository ' + nitFileData.repo_address + ' |'));
  console.log(chalk.white('|                                                           |'))
  console.log(chalk.white('-------------------------------------------------------------'))

  console.log(chalk.white("https://explorer.nebulas.io/#/testnet/tx/" + JSON.parse(body).result.txhash))
  console.log(chalk.white('Push success'))
}


