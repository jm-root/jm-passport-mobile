const error = require('jm-err')
const help = require('./help')
const wraper = require('./wraper')

let MS = require('jm-ms-core')
let ms = new MS()
let Err = error.Err

module.exports = function (opts = {}) {
  let service = this
  let config = service.config
  let router = ms.router()
  let codeKeyPrefix = config.code_key_prefix || 'sms:'

  service.wrapRoute = wraper(service)
  let wrap = service.wrapRoute

  let filterReady = async opts => {
    if (!service.ready) {
      throw error.err(Err.FA_NOTREADY)
    }
  }

  async function getCaptcha (opts) {
    let key = opts.params.key
    let doc = await service.verifycode.get(`/${codeKeyPrefix}${key}`)
    doc = await service.captcha.get(`/${doc.code}`)
    return doc
  }

  async function getSms (opts) {
    let data = opts.data
    let doc = null
    if (!config.disable_captcha) {
      doc = await service.verifycode.get(`/${codeKeyPrefix}${data.key}/check`, data)
    }

    let mobile = opts.params.mobile
    doc = await service.verifycode.get(`/${mobile}`)
    doc = await service.sms.get('/send', {
      PhoneNumbers: mobile,
      SignName: config.sign_name,
      TemplateCode: config.template_code,
      TemplateParam: '{"code":"' + doc.code + '"}'
    })
    return doc
  }

  async function register (opts) {
    let ips = opts.ips || []
    ips.length || (ips = [opts.ip])
    let data = opts.data
    let doc = await service.verifycode.get(`/${data.mobile}/check`, data)
    doc = await service.user.request({uri: '/signup', type: 'post', data, ips})
    return doc
  }

  /**
   * @api {post} /login 验证码登录
   * @apiParam {String} mobile   手机号
   * @apiParam {String} code   验证码
   *
   * @apiParamExample {json} 请求参数例子:
   * {
   * }
   *
   * @apiSuccessExample {json} 成功:
   * {
   * }
   */
  async function login (opts) {
    let ips = opts.ips || []
    ips.length || (ips = [opts.ip])
    let data = opts.data
    let doc = await service.verifycode.get(`/${data.mobile}/check`, data)
    doc = await service.user.get(`/users/${data.mobile}/exists`)
    doc = await service.sso.request({uri: '/signon', type: 'post', data: {id: doc.id}, ips})
    return doc
  }

  /**
   * @api {post} /resetPassword 验证码修改密码
   * @apiParam {String} mobile   手机号
   * @apiParam {String} code   验证码
   * @apiParam {String} password 新密码
   *
   * @apiParamExample {json} 请求参数例子:
   * {
   * }
   *
   * @apiSuccessExample {json} 成功:
   * {
   * }
   */
  async function resetPassword (opts) {
    let data = opts.data
    let doc = await service.verifycode.get(`/${data.mobile}/check`, data)
    doc = await service.user.get(`/users/${data.mobile}/exists`)
    await service.user.post(`/users/${doc.id}`, {password: data.password})
    return {ret: 1}
  }

  router
    .use(help(service))
    .use(wrap(filterReady, true))
    // .use('/register', wrap(register))
    // .use('/login', wrap(login))
    // .add('/resetPassword', 'post', wrap(resetPassword))
    .add('/captcha/:key', 'get', wrap(getCaptcha))
    .add('/sms/:mobile', 'get', wrap(getSms))

  return router
}
