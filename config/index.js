require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
var config = {
  development: {
    debug: true,
    lng: 'zh_CN',
    port: 3000,
    gateway: 'http://gateway.mdt.24haowan.com',
    disable_captcha: true,
    sign_name: '玖玖娱乐',
    template_code: 'SMS_101165048',
    modules: {
      'passport': {
        module: process.cwd() + '/lib'
      }
    }
  },
  production: {
    lng: 'zh_CN',
    port: 80,
    gateway: 'http://gateway.app',
    modules: {
      'passport': {
        module: process.cwd() + '/lib'
      }
    }
  }
}

var env = process.env.NODE_ENV || 'development'
config = config[env] || config['development']
config.env = env

module.exports = config
