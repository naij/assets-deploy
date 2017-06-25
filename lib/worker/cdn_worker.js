'use strict'

let path = require('path')
let fse = require('fs-extra')
let Upyun = require('upyun')
let BaseWorker = require('./base_worker')

class CDNWorker extends BaseWorker {
  constructor(options) {
    super(options)

    let bucket = this.config.unpyunBucket
    let username = process.env.UPYUN_USERNAME
    let password = process.env.UPYUN_PASSWORD
    this.upyunClient = new Upyun(bucket, username, password, 'v0.api.upyun.com', {
      apiVersion: 'v2'
    })
  }

  * putToDaily() {
    this.logger.info('开始同步文件至日常CDN环境...')

    let assetsPublishPath = `${this.assetsWorkspace}/build/`
    let cdnPublishPath = `/Users/wangjian/project/g/${this.nameSpace}`

    // 将需要发布的目录拷贝到CDN工作目录，统一处理
    // yield this.initCdnWorkspace(assetsPublishPath, cdnPublishPath)

    // 发布文件到cdn
    yield this.putFileToCdn(cdnPublishPath, 'daily')

    this.logger.success('同步日常CDN成功...')
    return true
  }

  * initCdnWorkspace(srcDir,destDir) {
    if (yield fse.exists(destDir)) {
      yield fse.remove(destDir)
    }

    yield fse.copy(srcDir, destDir)
  }

  * putFileToCdn(cdnPublishPath, publishType) {
    (function walk(basePath) {
      let files = yield fse.readdir(basePath)
      files.forEach(function(file) {
        let tmpPath = path.join(basePath, file)
        let stats = yield fse.stat(tmpPath)
        if (stats.isDirectory()) {
          walk(tmpPath)
        } else {
          console.log(tmpPath)
        }
      })
    }(cdnPublishPath))
  }
}

module.exports = CDNWorker