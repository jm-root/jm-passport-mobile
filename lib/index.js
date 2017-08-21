module.exports = function (opts) {
  ['SignName', 'TemplateCode', 'disableCaptcha']
    .forEach(function (key) {
      process.env[key] && (opts[key] = process.env[key])
    })

  var service = require('./service')(opts)
  var self = this
  this.on('open', function () {
    var router = self.servers.http.middle
    require('./router').call(service, router)
  })
  return service
}
