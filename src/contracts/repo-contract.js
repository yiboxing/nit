'use strict';

var NitRepo = function () {
};

NitRepo.prototype = {
  init: function () {
    LocalContractStorage.set("log", JSON.stringify([]));
  },
  commit: function (commitListString) {
    var logString = LocalContractStorage.get("log");
    var log = JSON.parse(logString); // [{'tx': 'xxx', 'msg': 'xxx'}, {...}, {...}]

    var commitList = JSON.parse(commitListString);
    for (var i = 0; i < commitList.length; i ++) {
      var txHash = commitList[i].txHash
      var message = commitList[i].message
      log.push({
        'tx': txHash,
        'msg': message
      })
    }
    // update commit log
    LocalContractStorage.set("log", JSON.stringify(log));
  },
  showLog: function () {
    var logString = LocalContractStorage.get("log");
     return logString;
  }
};

module.exports = NitRepo;