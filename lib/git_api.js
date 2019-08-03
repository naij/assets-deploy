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

  * getBranch(owner, repo, branchName) {
    let options = {
      url: `${this.host}${owner}/${repo}/branches/${branchName}`,
      method: 'GET',
      headers: {
        'User-Agent': repo
      }
    }
    let resp = yield request(options)
    return JSON.parse(resp.body)
  }

  * merge(owner, repo, baseBranch, headBranch) {
    let options = {
      url: `${this.host}${owner}/${repo}/merges`,
      method: 'POST',
      body: JSON.stringify({
        base: baseBranch,
        head: headBranch
      }),
      auth: {
        user: process.env.GITHUB_USERNAME,
        pass: process.env.GITHUB_PASSWORD
      },
      headers: {
        'User-Agent': repo
      }
    }
    let resp = yield request(options)

    if (resp.statusCode == '201' || resp.statusCode == '204') {
      return ''
    } else {
      return JSON.parse(resp.body)
    }
  }

  * delBranch(owner, repo, branchName) {
    let options = {
      url: `${this.host}${owner}/${repo}/git/refs/heads/${branchName}`,
      method: 'DELETE',
      auth: {
        user: process.env.GITHUB_USERNAME,
        pass: process.env.GITHUB_PASSWORD
      },
      headers: {
        'User-Agent': repo
      }
    }
    let resp = yield request(options)

    if (resp.body) {
      return JSON.parse(resp.body)
    } else {
      return ''
    }
  }

  get host() {
    return 'https://api.github.com/repos/'
  }
}

module.exports = GitApi