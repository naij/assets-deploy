'use strict'

let path = require('path')
let rd = require('rd')
let Upyun = require('upyun')
let Logger = require('../logger')
let config = require('../config')

class BaseWorker {
  constructor(options) {
    this._options = options || {}
    this.logger = new Logger()

    let bucketName = this.config.unpyunBucket
    let username = process.env.UPYUN_USERNAME
    let password = process.env.UPYUN_PASSWORD
    let bucket = new Upyun.Bucket(bucketName, username, password)
    this.upyunClient = new Upyun.Client(bucket)
  }

  * clear(status, path) {
    
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
      _timestamp = refName.match(/daily\/([\d]*.[\d]*.[\d])*$/)[1]
    } else if (/publish\/[\d]*.[\d]*.[\d]*$/.test(refName)) {
      _timestamp = refName.match(/publish\/([\d]*.[\d]*.[\d])*$/)[1]
    }

    return _timestamp
  }

  get refName() {
    return this._options.ref.match(/refs\/heads\/(.*)$/)[1]
  }

  get owner() {
    return this._options.repository.owner.name
  }

  get repo() {
    return this._options.repository.name
  }

  get assetsWorkspace() {
    return path.join(process.cwd(), 'tmp', this.repo)
  }

  get nameSpace() {
    return this.repo + '/' + this.timestamp
  }
}

module.exports = BaseWorker