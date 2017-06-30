var MS = require('jm-ms-core');
var msHttp = require('jm-ms-http');
let ms = new MS();
ms
    .use(msHttp.moduleClient)
;
module.exports = function (opts) {
    var o = {
        user: require('jm-user')(opts),
        sso: require('jm-sso')(opts),
    };
    ms.client({
        uri: opts.gateway + '/captcha'
    }, function (err, doc) {
        !err && doc && (o.captcha = doc);
    });
    ms.client({
        uri: opts.gateway + '/verifycode'
    }, function (err, doc) {
        !err && doc && (o.verifycode = doc);
    });
    ms.client({
        uri: opts.gateway + '/sms'
    }, function (err, doc) {
        !err && doc && (o.sms = doc);
    });
    o.passport = require('./passport')(o);
    return o;
};
