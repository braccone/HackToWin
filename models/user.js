var bcrypt = require('bcryptjs');
// var r = require('rethinkdbdash')({
// 	host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 28015,
//     db: 'loginapp',
// 	authKey: '',
// });
// var dbConfig = require('../config');
//
// // var connection = r.connect(dbConfig);


var find = function (tableName, id) {
    return r.table(tableName).get(id).run()
    .then(function (result) {
        return result;
    });
};

var findAll = function (tableName) {
    return r.table(tableName).run()
    .then(function (cursor) {
        return cursor.toArray();
    });
};

var findBy = function (tableName, fieldName, value,call) {
    return r.table(tableName).filter(r.row(fieldName).eq(value)).run()
    .then(function (cursor) {
        return cursor.toArray();
    });
};

var findIndexed = function (tableName, query, index) {
    return r.table(tableName).getAll(query, { index: index }).run()
    .then(function (cursor) {
        return cursor.toArray();
    });
};

var save = function (tableName, object) {
    return r.table(tableName).insert(object).run()
    .then(function (result) {
        return result;
    })
    .error(function(err){
		console.log('error occurred ',err);
	});
};

var edit = function (tableName, id, object) {
    return r.table(tableName).get(id).update(object).run()
    .then(function (result) {
        return result;
    });
};

var destroy = function (tableName, id) {
    return r.table(tableName).get(id).delete().run()
    .then(function (result) {
        return result;
    });
};
module.exports.createUser = function(newUser,callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        save('utenti',newUser);
	        callback();
	    });
	});
};

module.exports.getUserByUsername = function(username, callback){
	findBy('utenti','username',username, callback);
};

module.exports.getUserById = function(id, callback){
	findBy('utenti','id',id);
	callback();
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, res) {
    	if(err) throw err;
    	callback(null,isMatch);
	});
};
