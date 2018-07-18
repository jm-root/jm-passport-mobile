const $ = require('./service')

let router = null
beforeAll(async () => {
  await $.onReady()
  router = $.router()
})

let mobile = '13609075005'
test('captcha', async () => {
  let doc = await router.get(`/captcha/${mobile}`)
  console.log(doc)
  expect(doc).toBeTruthy()
})

test('sms', async () => {
  let doc = await router.get(`/sms/${mobile}`)
  console.log(doc)
  expect(doc).toBeTruthy()
})
