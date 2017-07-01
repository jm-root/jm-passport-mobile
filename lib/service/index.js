var MS = require('jm-ms-core');
var msHttp = require('jm-ms-http');
var msWS = require('jm-ms-ws');
let ms = new MS();
ms
    .use(msHttp.moduleClient)
    .use(msWS.moduleClient)
;
module.exports = function (opts) {
    var o = {
        user: require('jm-user')(opts),
    };

    var bind = function (name, uri) {
        uri || (uri = '/' + name);
        ms.client({
            uri: opts.gateway + uri
        }, function (err, doc) {
            !err && doc && (o[name] = doc);
        });
    };

    bind('sso');
    bind('captcha');
    bind('verifycode');
    bind('sms');

    o.passport = require('./passport')(o);
    return o;
};
