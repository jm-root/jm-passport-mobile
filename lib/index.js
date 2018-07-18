const Service = require('./service')
const router = require('./router')

module.exports = function (opts) {
  ['sign_name', 'template_code', 'disable_captcha', 'code_key_prefix']
    .forEach(function (key) {
      process.env[key] && (opts[key] = process.env[key])
    })

  let o = new Service(opts)
  o.router = router
  return o
}
