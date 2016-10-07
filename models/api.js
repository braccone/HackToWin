// var rdb = require('rethinkdb');
var config = require('../config/config');
var passport = require('passport');
var bcrypt = require('bcryptjs');
var LocalStrategy = require('passport-local').Strategy;
var thinky = require('thinky')({
	host: config.rethinkdb.host,
	port: config.rethinkdb.port,
	db: config.rethinkdb.db
	});

var type = thinky.type;
var r = thinky.r;
var Query = thinky.Query;
//modelli relativi alle tabelle
var User = thinky.createModel('utenti',{
	id: type.string(),
	username: type.string(),
	email: type.string().email(),
	password: type.string(),
	comandi:{
		up: type.number(),
		down: type.number(),
		left: type.number(),
		right: type.number(),
		interaction: type.number()
	},
	avatarId: type.string(),
	pos:{
		mapId: type.string(),
		x: type.number(),
		y: type.number()
	}

});

User.ensureIndex('id');

var Avatar = thinky.createModel('avatar',{
	id: type.string(),
	nome: type.string(),
	percorso: type.string()
});

var Missioni = thinky.createModel('missioni',{
	id: type.string(),
	titolo: type.string(),
	descrizione: type.string(),
	flag: type.string(),
	punteggio: type.number(),
	pos:{
		mapId: type.string(),
		x: type.number(),
		y: type.number()
	}
});

var Mappe = thinky.createModel("mappe",{
	id: type.string(),
	nome: type.string(),
	mapJson: type.string()
});

var UserMissioni = thinky.createModel("utenti_missioni",{
	id: type.string(),
	userId: type.string(),
	missionId: type.string(),
	dataInizio: type.date(),
	dataFine: type.date()
})
// Relazioni tra tabella
Avatar.hasMany(User, "useravatar", "id", "avatarId");
Mappe.hasMany(Missioni,"missions","id","pos.mapId");
Mappe.hasMany(User,"mapUser","id","pos.mapId");
User.hasMany(UserMissioni,"userDate","id","userId");
Missioni.hasMany(UserMissioni,"missionDate","id","missionId");

Avatar.get("bb375656-23ca-43e5-9db0-842879154b6b").getJoin({useravatar: true})
    .run().then(function(avatar) {
    	console.log(avatar.useravatar[0].comandi);
	})
    .error(function(err) {
    	console.log(err)
    });


exports.findUser = function(){
	return r.table(User.getTableName()).filter('id')
    	.run().then(function(result) {
				if(result){return result.toArray();}
    		return null;
	}).error(function(err){
		return {"err":err};
	});
}
exports.findAllUser = function(){
	return r.table(User.getTableName()).run().then(function(result){
		if(result) return result.toArray();
		return null;
	})
	.error(function(err){
		return {"err":err};
	})
}

exports.findBy = function(table,fieldName, value){
	r.table(table.getTableName()).filter(r.row(fieldName).eq(value)).run().then(function(result){
		if(result) return result.toArray();
		return null;
	})
	.error(function(err){
		return {"err":err};
	})
}
// Funzione che permette all'utente di registrarsi con i dovuti controlli
exports.addUser = function(req,res){

	// controlli campi
	req.checkBody('username','E\' richiesto un username').notEmpty();
	req.checkBody('email','E\' richiesta una e-mail').notEmpty();
	req.checkBody('email','L\'email non valida').isEmail();
	req.checkBody('password','E\' richiesta una password').notEmpty();
	req.checkBody('password2','Le Password non corrispondono').equals(req.body.password);

	var errors = req.validationErrors();
	if(errors){
		res.render('../register',{
			errors:errors
		});
	}
	else{

		var utente = new User({
			username:req.body.username,
			email: req.body.email,
			password: bcrypt.hashSync(req.body.password, 10),
			comandi:{
				up: 77,         //w
				down: 73,       //s
				left: 61,       //a
				right: 64,      //d
				interaction: 65 //e
			},
			avatarId: "bb375656-23ca-43e5-9db0-842879154b6b"
		});
		User.filter({username: utente.username}).run()
		.then(function(result){
			if (result.length!=0){
				console.log(result.length);
				res.render('../register',{error_msg:"Il nome utente è già stato utilizzato."});
			}
			else{
				User.filter({email: utente.email}).run()
				.then(function(result){
					if (result.length!=0){
						res.render('../register',{error_msg:"l'email è già stata utilizzata."});
					}
					else{
						utente.save().then(function(result){
							req.flash('success_msg','Registrazione avvenuta con successo.');
							res.redirect('/login');
						}).error(function(err){
							res.render('../register',{ error_msg: err});
						});
					}
				})
			}
		})
		
		
	}
}

// aggiungere pagina admin
// Aggiungere missione al database
// Aggiungere nuove stanze
// Aggiungere pagina profilo(modifica email,statistiche personali,modifica username)
// aggiungere pagina statistiche
// aggiungere pagina shell

// PASSPORT STRATEGIES
passport.use(new LocalStrategy(
	function(username, password, done) {

		r.table(User.getTableName()).filter(r.row('username').eq(username)).run().then(function (user) {
			// fondamentale altrimenti non funziona un cazzo
			user.toArray;
			if (user.length == 0) {
				console.log('sono entrato');
				return done(null, false, { message: 'Incorrect username.' });
			}
			else{
				// console.log(user[0].password);
				if (!bcrypt.compareSync(password, user[0].password)) {

					return done(null, false, { message: 'Incorrect password.' });
				}
				return done(null, user);
			}
		})
		.error(function(err){
			if (err) { return done(err); }
		});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user[0].username);
});

passport.deserializeUser(function (username, done) {
	r.table(User.getTableName()).filter(r.row('username').eq(username)).run().then(function(user){
		done(null,user);
	})
});