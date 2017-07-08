'use strict'

let path = require('path')
let rd = require('rd')
let fse = require('fs-extra')
let exec = require('child-process-promise').exec
let Logger = require('../logger')
let config = require('../config')
let GitApi = require('../git_api')

class BaseWorker {
  constructor(options) {
    this._options = options || {}
    this.logger = new Logger(options)
    this.gitApi = new GitApi()
  }

  * clear(status) {
    if (status == 'success') {
      // 归档中央仓库
      if (/publish/.test(this.refName)) {
        try {
          yield this.gitApi.merge(this.owner, this.repo, 'master', `daily/${this.timestamp}`)
          this.logger.success('将代码归档到中央仓库的<master>分支成功')
        } catch(e) {
          this.logger.warning(`将代码归档到中央仓库的<master>分支失败，请手动归档，${e}`)
        }

        try {
          yield this.gitApi.delBranch(this.owner, this.repo, `daily/${this.timestamp}`)
          this.logger.success(`删除线上<daily/${this.timestamp}>分支成功`)
        } catch(e) {
          this.logger.warning(`删除线上<daily/${this.timestamp}>分支失败，请手动删除，${e}`)
        }
      }

      yield fse.remove(this.assetsTarPath)

      this.logger.success('发布成功')

      return true
    } else if (status == 'error') {
      this.logger.error('发布失败')
      if (/publish/.test(this.refName)) {
        this.logger.info(`清理里程碑标签：<${this.refName}>`)

        try {
          yield exec(`git --work-tree=${this.assetsTarPath} --git-dir=${this.assetsTarPath}/.git push origin :${this.refName}`)
        } catch(e) {
          this.logger.error(`清理里程碑标签失败，失败原因：${e}`)
        }
      }

      yield fse.remove(this.assetsTarPath)
      this.logger.success(`清除目录: ${this.assetsTarPath} 完毕`)

      return false
    }
  }

  fileWalk(filePath, cb) {
    rd.read(filePath, cb)
  }

  get config() {
    return config
  }

  get timestamp() {
    let refName = this._options.ref
    let _timestamp = ''

    if (/daily\/[\d]*.[\d]*.[\d]*$/.test(refName)) {
      _timestamp = refName.match(/daily\/([\d]*.[\d]*.[\d]*)$/)[1]
    } else if (/publish\/[\d]*.[\d]*.[\d]*$/.test(refName)) {
      _timestamp = refName.match(/publish\/([\d]*.[\d]*.[\d]*)$/)[1]
    }

    return _timestamp
  }

  get refName() {
    return this._options.ref.match(/refs\/(heads|tags)\/(.*)$/)[2]
  }

  get owner() {
    return this._options.repository.owner.name
  }

  get repo() {
    return this._options.repository.name
  }

  get assetsTarPath() {
    return path.join(process.cwd(), 'tmp', this.repo)
  }

  get nameSpace() {
    return this.repo + '/' + this.timestamp
  }
}

module.exports = BaseWorker