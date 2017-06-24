'use strict';

let BaseWorker = require('./worker/base_worker')
let GitWorker = require('./worker/git_worker')
let CDNWorker = require('./worker/cdn_worker')

class BuildDaily extends BaseWorker {
  constructor(options) {
    super(options)

    this.gitWorker = new GitWorker(options)
    this.cdnWorker = new CDNWorker(options)
  }

  * run() {

    // 检查master是否有更新
    if (!(yield this.gitWorker.isMasterLasted())) {
      this.clear('error')
    }

    // 检查是否存在对应的正式版本号
    if (!(yield this.gitWorker.isPublishTagExist())) {
      this.clear('error')
    }

    // // clone代码
    // if (!(yield this.gitWorker.cloneCode())) {
    //   this.clear('error')
    // }

    // // 同步日常CDN环境
    // if (!(yield this.cdnWorker.putToDaily())) {
    //   this.clear('error')
    // }

    // // 
    // this.clear('success')
  }
}

module.exports = BuildDaily