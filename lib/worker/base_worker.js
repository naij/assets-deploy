'use strict'

let path = require('path')
let Logger = require('../logger')
let config = require('../config')

class BaseWorker {
  constructor(options) {
    this._options = options || {}
    this.logger = new Logger()
  }

  * clear(status, path) {

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