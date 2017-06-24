'use strict';

let moment = require('moment')
let chalk = require('chalk')

class Logger {
  info(contents) {
    let msg = chalk.cyan(`${this.getTime} Info | ${contents}\n`)

    this.log(msg)
  }

  error(contents) {
    let msg = chalk.red(`${this.getTime} Error | ${contents}\n`)

    this.log(msg)
  }

  success(contents) {
    let msg = chalk.green(`${this.getTime} Success | ${contents}\n`)

    this.log(msg)
  }

  warning(contents) {
    let msg = chalk.yellow(`${this.getTime} Warn | ${contents}\n`)

    this.log(msg)
  }

  log(msg) {
    process.stdout.write(msg)
  }

  get getTime() {
    return moment(new Date()).format('YYYY MM DD, k:mm:ss')
  }
}

module.exports = Logger