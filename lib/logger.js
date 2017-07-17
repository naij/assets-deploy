'use strict'

let fs = require('fs')
let os = require('os')
let path = require('path')
let moment = require('moment')
let chalk = require('chalk')
let mkdirp = require('mkdirp')

class Logger {
  constructor(options) {
    this._stream = null
    this._options = options
    this._reload()
  }

  info(contents) {
    let msg = chalk.cyan(`${this.getTime} Info | ${contents}`)

    this._log(msg)
  }

  error(contents) {
    let msg = chalk.red(`${this.getTime} Error | ${contents}`)

    this._log(msg)
  }

  success(contents) {
    let msg = chalk.green(`${this.getTime} Success | ${contents}`)

    this._log(msg)
  }

  warning(contents) {
    let msg = chalk.yellow(`${this.getTime} Warn | ${contents}`)

    this._log(msg)
  }

  _log(msg) {
    if (msg.length) {
      process.stdout.write(msg)
      this._write(this._parse(msg))
    }
  }

  _reload() {
    // 关闭原来的 stream
    this._closeStream()
    // 新创建一个 stream
    this._stream = this._createStream()
  }

  _write(buf) {
    this._stream.write(buf)
  }

  _createStream() {
    mkdirp.sync(path.dirname(this._options.logFile))
    const stream = fs.createWriteStream(this._options.logFile, { flags: 'a' })
    return stream
  }

  _closeStream() {
    if (this._stream) {
      this._stream.end()
      this._stream = null
    }
  }

  _parse(msg) {
    return msg.replace(/\u001b\[(\d+m)(.*)\u001b\[(\d+m)/, function($1, $2, $3, $4) {
      if ($2 == '31m') {
        return `<p class="color-red">${$3}</p>`
      } else if ($2 == '32m') {
        return `<p class="color-green">${$3}</p>`
      } else if ($2 == '33m') {
        return `<p class="color-yellow">${$3}</p>`
      } else if ($2 == '36m') {
        return `<p class="color-blue">${$3}</p>`
      }
    })
  }

  _logFilePath(options) {
    let serverEnv
    if (process.env.NODE_ENV === 'test') {
      serverEnv = 'unittest'
    } else if (process.env.NODE_ENV === 'production') {
      serverEnv = 'prod'
    } else {
      serverEnv = 'local'
    }

    let baseDir = process.cwd()
    let appHome
    if (os.userInfo && os.userInfo().homedir) {
      appHome = os.userInfo().homedir
    } else if (os.homedir) {
      appHome = os.homedir()
    } else {
      appHome = process.env.HOME
    }

    let appRoot = serverEnv === 'local' || serverEnv === 'unittest' ? baseDir : appHome

    this.logFile = path.join(appRoot, 'logs', 'assets-deploy', options.after + '.log')
  }

  get getTime() {
    return moment(new Date()).format('YYYY MM DD, k:mm:ss')
  }
}

module.exports = Logger