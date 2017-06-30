var _ = require('lodash');
var passport = require('passport');
var error = require('jm-err');
var log = require('jm-log4js');
var Err = error.Err;
var logger = log.logger;

module.exports = function (router) {
    var service = this;
    router.post('/login', passport.authenticate(['local'], {
            session: false
        }),
        function (req, res) {
            res.json(req.user || error.Err.FA_NOAUTH);
        });

    router.get('/captcha/:mobile', function (req, res) {
        var mobile = req.params.mobile;
        service.verifycode.get('/vc' + mobile, function (err, doc) {
            if (err) return res.json(doc);
            logger.debug(doc.code);
            service.captcha.get('/' + doc.code, function (err, doc) {
                res.json(doc);
            });
        });
    });

    router.get('/sms/:mobile', function (req, res) {
        var mobile = req.params.mobile;
        var data = {};
        _.defaults(data, req.body, req.query);
        service.verifycode.get('/vc' + mobile + '/check', data, function (err, doc) {
            if (err) return res.json(err, doc);
            service.verifycode.get('/' + mobile, function (err, doc) {
                if (err) return res.json(doc);
                logger.debug(doc.code);
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
            if (err) return res.json(err, doc);
            service.user.signup(data)
                .then(function (doc) {
                    res.json({
                        id: doc.id,
                        uid: doc.uid
                    });
                })
                .catch(function (err) {
                    console.log(err);
                    res.json(Err.FAIL);
                });
            ;
        });
    });
};
