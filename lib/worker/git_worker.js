'use strict'

let _ = require('lodash')
let fse = require('fs-extra')
let exec = require('child-process-promise').exec
let BaseWorker = require('./base_worker')
let GitApi = require('../git_api')

class GitWorker extends BaseWorker {
  constructor(options) {
    super(options)
  }

  // 检查master是否有更新
  * isMasterLasted() {
    this.logger.info('开始检查Master分支有无更新...')
    let res
    try {
      res = yield this.gitApi.compareCommits(this.owner, this.repo, 'master', this.refName)
    } catch(e) {
      this.logger.error(`检查Master分支异常,错误信息:${e}`)
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
      this.logger.error(`检查版本号异常,错误信息:${e}`)
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

  // 检查publish的hash值是否和daily的相同
  * isPublishEqDaily() {
    let publishName = `publish/${this.timestamp}`
    let dailyName = `daily/${this.timestamp}`
    let publishCommit = yield this.gitApi.getTag(this.owner, this.repo, publishName)
    let dailyCommit = yield this.gitApi.getBranch(this.owner, this.repo, dailyName)

    if (!publishCommit.ref) {
      this.logger.error(`git上找不到对应的<${publishName}>tag`)
      return false
    }

    if (!dailyCommit.name) {
      this.logger.error(`git上找不到对应的<${dailyName}>分支`)
      return false
    }

    let publishCommitId = publishCommit.object.sha
    let dailyCommitId = dailyCommit.commit.sha

    if (publishCommitId != dailyCommitId) {
      this.logger.info(`<${dailyName}>: ${dailyCommitId}`)
      this.logger.info(`<${publishName}>: ${publishCommitId}`)
      this.logger.error(`请将<master>分支合并到<${dailyName}>分支; 或将<${dailyName}>分支的修改 push到git上，再重新打<${publishName}>的tag`)
      return false
    }

    this.logger.success("SHA-1 Hash 对比校验通过")
    return true
  }

  // clone 代码
  * cloneCode() {
    this.logger.info(`开始下载${this.repo} -- ${this.refName}的代码...`)
    let result

    yield fse.remove(this.assetsTarPath)

    try {
      result = yield exec(`git clone ${this.config.gitSshUrl}:${this.owner}/${this.repo}.git --depth=1 -b ${this.refName} ${this.assetsTarPath} > /dev/null 2>&1`)
    } catch(e) {
      this.logger.error(`下载代码异常,错误信息:${e}`)
      return false
    }

    if (result.stderr) {
      this.logger.error('下载代码失败')
      return false
    } else {
      this.logger.success('下载代码成功')
      return true
    }
  }
}

module.exports = GitWorker