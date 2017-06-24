let BaseWorker = require('./base_worker')

class CDNWorker extends BaseWorker {
  constructor(options) {
    super(options)
  }
}

module.exports = CDNWorker