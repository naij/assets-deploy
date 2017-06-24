'use strict'

let request = require('co-request')

class GitApi {
  * compareCommits(owner, repo, from, to) {
    let options = {
      url: `${this.host}${owner}/${repo}/compare/${from}...${to}`,
      method: 'GET',
      headers: {
        'User-Agent': repo
      }
    }
    let resp = yield request(options)
    return JSON.parse(resp.body)
  }

  * getTag(owner, repo, tagName) {
    let options = {
      url: `${this.host}${owner}/${repo}/git/refs/tags/${tagName}`,
      method: 'GET',
      headers: {
        'User-Agent': repo
      }
    }
    let resp = yield request(options)
    return JSON.parse(resp.body)
  }

  get host() {
    return 'https://api.github.com/repos/'
  }
}

module.exports = GitApi