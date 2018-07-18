const event = require('jm-event')
const MS = require('jm-ms')

let ms = MS()

class Passport {
  constructor (opts = {}) {
    event.enableEvent(this)
    this.ready = true
    this.config = opts
    let self = this
    let bind = (name, uri) => {
      uri || (uri = '/' + name)
      ms.client({
        uri: opts.gateway + uri
      }, function (err, doc) {
        !err && doc && (self[name] = doc)
      })
    }
    bind('sso')
    bind('user')
    bind('captcha')
    bind('verifycode')
    bind('sms')
  }

  onReady () {
    let self = this
    return new Promise(function (resolve, reject) {
      if (self.ready) return resolve(self.ready)
      self.once('ready', function () {
        resolve(self.ready)
      })
    })
  }
}

module.exports = Passport
