let _ = require('lodash')
var exec = require('child-process-promise').exec
let BaseWorker = require('./base_worker')
let GitApi = require('../git_api')

class GitWorker extends BaseWorker {
  constructor(options) {
    super(options)

    this.gitApi = new GitApi()
  }

  // 检查master是否有更新
  * isMasterLasted() {
    this.logger.info('开始检查Master分支有无更新...')
    let res
    try {
      res = yield this.gitApi.compareCommits(this.owner, this.repo, 'master', this.refName)
    } catch(e) {
      this.logger.error('检查Master分支异常')
      return false
    }
    
    if (res.status == '') {
      this.logger.error('检查失败,请检查Gitlab上是否有master分支的存在...')
      return false
    } else if (res.status == 'behind') {
      this.logger.error('检查失败,Master上有新的commit提交,请在本地合并master分支后再提交...')
      return false
    } else {
      this.logger.success('检查成功,Master分支无更新')
      return true
    }
  }

  // 检查是否存在对应的正式版本号
  * isPublishTagExist() {
    this.logger.info('正在检查线上是否存在对应版本号的tag...')
    let targetPublishName = `publish/${this.timestamp}`
    let res

    try {
      res = yield this.gitApi.getTag(this.owner, this.repo, targetPublishName)
    } catch(e) {
      this.logger.error('检查版本号异常,请尝试重新提交代码')
      return false
    }

    if (res.ref) {
      this.logger.error(`时间戳冲突,线上已经存在时间戳为:${this.timestamp} 的tag:<${targetPublishName}>,请修改时间戳!`)
      return false
    } else {
      this.logger.success('检查成功,线上无对应版本号的tag')
      return true
    }
  }

  // 正式发布校验
  * check4publish() {

  }

  // clone 代码
  * cloneCode() {
    // this.logger.info(`开始下载${this.repo} -- ${this.refName}的代码...`)
    // let result

    // try {
    //   result = yield exec(`git clone ${config.gitSshUrl}:${this.repo}.git --depth=1 -b ${this.refName} ${g_workspace} >  /dev/null 2>&1`)
    // } catch(e) {
    //   this.logger.error(`下载代码异常,错误信息:${e}`)
    //   return false
    // }

    // if (result) {
    //   this.logger.error('下载代码失败')
    //   return false
    // } else {
    //   this.logger.success('下载代码成功')
    //   return true
    // }
  }
}

module.exports = GitWorker