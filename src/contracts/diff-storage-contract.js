'use strict';

var DiffStorage = function () {
  LocalContractStorage.defineProperties(this, {
    diffData: null,
    commitMessage: null
  });
};

DiffStorage.prototype = {
  init: function (diffData, commitMessage) {
    this.diffData = diffData;
    this.commitMessage = commitMessage;
  },
  getDiffData: function () {
    return this.diffData
  },
  getCommitMessage: function () {
    return this.commitMessage;
  }
};

module.exports = DiffStorage;