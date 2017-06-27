'use strict'

let path = require('path')
let fse = require('fs-extra')
let Upyun = require('upyun')
let thunkify = require('thunkify')
let BaseWorker = require('./base_worker')

class CDNWorker extends BaseWorker {
  constructor(options) {
    super(options)

    let bucketName = this.config.unpyunBucket
    let username = process.env.UPYUN_USERNAME
    let password = process.env.UPYUN_PASSWORD
    let bucket = new Upyun.Bucket(bucketName, username, password)
    this.upyunClient = new Upyun.Client(bucket)
  }

  * putToDaily() {
    this.logger.info('开始同步文件至日常CDN环境...')

    let assetsPublishPath = `${this.assetsTarPath}/build`

    try {
      // 发布文件到cdn
      let resp = yield this.putFileToCdn(assetsPublishPath, 'daily')
      this.logger.success('同步日常CDN成功...')
      return true
    } catch(e) {
      this.logger.error('同步日常CDN失败...')
      return false
    }
  }

  * putToPublish() {
    this.logger.info('开始同步文件至正式CDN环境...')

    let assetsPublishPath = `${this.assetsTarPath}/build`

    try {
      // 发布文件到cdn
      let resp = yield this.putFileToCdn(assetsPublishPath, 'publish')
      this.logger.success('同步正式CDN成功...')
      return true
    } catch(e) {
      this.logger.error('同步正式CDN失败...')
      return false
    }
  }

  * putFileToCdn(assetsPublishPath, publishType) {
    let files = yield thunkify(this.fileWalk)(assetsPublishPath)

    for(let i = 0; i < files.length; i++) {
      let stats = yield fse.stat(files[i])
      if (stats.isDirectory()) { continue }

      let fileName = files[i].split(assetsPublishPath)[1]
      let remoteCdnFilePath = (publishType == 'daily' ? '/d/' : '/g/') + this.nameSpace + fileName
      let fileData = yield fse.readFile(files[i])
      try {
        let resp = yield this.upyunClient.putFile(remoteCdnFilePath, fileData)
      } catch(e) {
        this.logger.error(`上传失败，失败原因：${e}`)
      }
    }
  }
}

module.exports = CDNWorker