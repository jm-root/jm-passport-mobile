var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var error = require('jm-err');

module.exports = function (service, opts) {
    passport
        .use(new Strategy(
            function (username, password, cb) {
                service.user.signon(username, password, function (err, doc) {
                    if (!err && doc && doc.id) {
                        service.sso.post('/signon', doc, cb);
                    } else {
                        if(err && !doc) {
                            doc = {
                                err: err.code || error.Err.FA_NOAUTH.err,
                                msg: err.message
                            };
                        }
                        return cb(null, doc || error.Err.FA_NOAUTH);
                    }
                });
            }));
    return passport;
};
