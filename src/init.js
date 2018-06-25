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
var deployNonce;

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

  // deploy contract
  console.log(chalk.white('Getting account status:'));
  request.post({
    headers: {
      'content-type' : 'application/json;charset=UTF-8',
      'X-DevTools-Emulate-Network-Conditions-Client-Id' : 'DBD82AD3541AFF90B7FCF164CDC1757A',
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
    },
    url:     'https://testnet.nebulas.io/v1/user/accountstate',
    body:    '{"address":"' + account.getAddressString() + '"}'
  }, onGetAccountStatus);
}

function onGetAccountStatus(error, response, body) {
  console.log(chalk.yellow(body));
  //generate raw transaction
  deployNonce = parseInt(JSON.parse(body).result.nonce) + 1;

  //keyFileContent
  var repoContract = {
    'source': repoContractContent,
    'sourceType': 'js',
  }
  var tx = new neb.Transaction({
   chainID: 1001,
   from: account,
   to: account.getAddressString(),
   value: 0,
   nonce: deployNonce,
   gasPrice: 1000000,
   gasLimit: 2000000000,
   contract: repoContract
});

  console.log(chalk.white('Signing repository contract..'));
  tx.signTransaction();
  
  console.log(chalk.white('Deploying repository contract..'));
  console.log(tx.toProtoString())
  request.post({
    headers: {
      'content-type' : 'application/json;charset=UTF-8',
      'X-DevTools-Emulate-Network-Conditions-Client-Id' : 'DBD82AD3541AFF90B7FCF164CDC1757A',
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
    },
    url:     'https://testnet.nebulas.io/v1/user/rawtransaction',
    body:    '{"data":"' + tx.toProtoString() + '"}'
  }, onRepoContractDeploy);
}

function onRepoContractDeploy(err, response, body) {
  console.log(chalk.yellow(body));
  console.log(chalk.white('https://explorer.nebulas.io/#/testnet/tx/' + JSON.parse(body).result.txhash));

  // create nit folder if there isn't any
  if (!fs.existsSync(process.cwd() + '/nit')){
      fs.mkdirSync(process.cwd() + '/nit');
  }

  var nitFileContent = JSON.stringify({repo_address: JSON.parse(body).result.contract_address, deploy_nonce: deployNonce})
  fs.writeFileSync(process.cwd() + '/nit/.nit', nitFileContent)
  console.log(chalk.white('---------------------------------------------------------------'))
  console.log(chalk.white('|                                                             |'))
  console.log(chalk.white('| Repository initialized: ' + JSON.parse(body).result.contract_address + ' |'));
  console.log(chalk.white('|                                                             |'))
  console.log(chalk.white('---------------------------------------------------------------'))

}


