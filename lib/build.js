'use strict'

let BaseWorker = require('./worker/base_worker')
let BuildDaily = require('./build_daily')
let BuildPublish = require('./build_publish')

class Build extends BaseWorker {
  constructor(options) {
    super(options)
  }

  * run() {
    let refName = this.refName
    let buildDaily = new BuildDaily(this._options)
    let buildPublish = new BuildPublish(this._options)

    // push master 分支或者删除分支、tag不触发发布行为
    if (/master/.test(refName) || this._options.gitData.deleted) {
      return true
    } else if (/daily\/[\d]*.[\d]*.[\d]*$/.test(refName)) {
      this.logger.info('您提交的是一个日常发布，进入日常发布流程...')
      return yield buildDaily.run()
    } else if (/publish\/[\d]*.[\d]*.[\d]*$/.test(refName)) {
      this.logger.info('您提交的是一个正式发布，进入正式发布流程...')
      return yield buildPublish.run()
    } else {
      this.logger.error('您提交的分支格式不对，请检查后重新提交.')
      return false
    }
  }
}

module.exports = Build