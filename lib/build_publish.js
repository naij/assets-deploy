'use strict'

let BaseWorker = require('./worker/base_worker')
let GitWorker = require('./worker/git_worker')
let CDNWorker = require('./worker/cdn_worker')

class BuildPublish extends BaseWorker {
  constructor(options) {
    super(options)

    this.gitWorker = new GitWorker(options)
    this.cdnWorker = new CDNWorker(options)
  }

  * run() {
    // 检查master是否有更新
    if (!(yield this.gitWorker.isMasterLasted())) {
      return yield this.clear('error')
    }

    // 检查publish的hash值是否和daily的相同
    if (!(yield this.gitWorker.isPublishEqDaily())) {
      return yield this.clear('error')
    }

    // clone代码
    if (!(yield this.gitWorker.cloneCode())) {
      return yield this.clear('error')
    }

    // 同步正式CDN环境
    if (!(yield this.cdnWorker.putToPublish())) {
      return yield this.clear('error')
    }

    return yield this.clear('success')
  }
}

module.exports = BuildPublish