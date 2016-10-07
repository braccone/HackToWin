var bcrypt = require('bcryptjs');
// var Promise = require('bluebird');
// var token = require('./token');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var r = require('../models/api');



module.exports.hash_password = function (password) {
    return new Promise(function (resolve, reject) {
        bcrypt.genSalt(10, function (error, salt) {
            if(error) return reject(error);

            bcrypt.hash(password, salt, function (error, hash) {
                if(error) return reject(error);
                return resolve(hash);
            });
        });
    });
};

module.exports.comparePassword = function (password, hash) {
	return new Promise(function (resolve, reject) {
		bcrypt.compare(password, hash, function (error, response) {
			if(error) return reject(error);
			return resolve(response);
		});
	});
};

// module.exports.authorize = function (request, response, next) {
//     var apiToken = request.headers['x-api-token'];
//     token.verify(apiToken, next);
//     next();
// };



// module.exports = passport;
