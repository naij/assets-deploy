'use strict'

let path = require('path')
let fse = require('fs-extra')
let thunkify = require('thunkify')
let BaseWorker = require('./base_worker')

class CDNWorker extends BaseWorker {
  constructor(options) {
    super(options)
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
    let files = yield thunkify(this.fileWalk)(cdnPublishPath)

    for(let i = 0; i < files.length; i++) {
      let stats = yield fse.stat(files[i])
      if (stats.isDirectory()) { continue }

      let fileName = files[i].split(cdnPublishPath)[1]
      let cdnFilePath = '/g/' + this.nameSpace + fileName
      let fileData = yield fse.readFile(files[i])
      try {
        let resp = yield this.upyunClient.putFile(cdnFilePath, fileData)
        console.log(resp)
      } catch(e) {
        this.logger.error(`上传失败，失败原因：${e}`)
      }
    }
  }
}

module.exports = CDNWorker