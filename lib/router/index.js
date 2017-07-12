var _ = require('lodash');
var passport = require('passport');
var error = require('jm-err');
var log = require('jm-log4js');
var Err = error.Err;
var logger = log.logger;

module.exports = function (router) {
    var service = this;
    var t = function (doc, lng) {
        if(lng && doc.err && doc.msg) {
            doc.msg = service.user.t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg;
        }
    };
    router.post('/login', passport.authenticate(['local'], {
            session: false
        }),
        function (req, res) {
            var doc = req.user;
            t(doc, req.lng);
            res.json(doc);
        });

    router.get('/captcha/:key', function (req, res) {
        var key = req.params.key;
        service.verifycode.get('/cc' + key, function (err, doc) {
            if (err) return res.json(doc);
            service.captcha.get('/' + doc.code, function (err, doc) {
                res.json(doc);
            });
        });
    });

    router.get('/sms/:mobile', function (req, res) {
        var mobile = req.params.mobile;
        var data = {};
        _.defaults(data, req.body, req.query);
        service.verifycode.get('/cc' + data.key + '/check', data, function (err, doc) {
            if (err) return res.json(doc);
            service.verifycode.get('/' + mobile, function (err, doc) {
                if (err) return res.json(doc);
                service.sms.get('/send', {mobile: mobile, msg: '【酷爱捕鱼】您的验证码是' + doc.code}, function (err, doc) {
                    res.json(doc);
                });
            });
        });
    });

    router.post('/register', function (req, res) {
        var data = {};
        _.defaults(data, req.body, req.query);

        service.verifycode.get('/' + data.mobile + '/check', data, function (err, doc) {
            if (err) return res.json(doc);
            service.user.signup(data)
                .then(function (doc) {
                    res.json({
                        id: doc.id,
                        uid: doc.uid
                    });
                })
                .catch(function (err) {
                    var doc = Err.FAIL;
                    err.code && (doc.err = err.code);
                    err.message && (doc.msg = err.message);
                    t(doc, req.lng);
                    res.json(doc);
                });
            ;
        });
    });
};
