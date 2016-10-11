// var rdb = require('rethinkdb');
var config = require('../config/config');
var passport = require('passport');
var bcrypt = require('bcryptjs');
var LocalStrategy = require('passport-local').Strategy;
var thinky = require('thinky')({
	host: config.rethinkdb.host,
	port: config.rethinkdb.port,
	db: config.rethinkdb.db,
	user: config.rethinkdb.user,
	password: config.rethinkdb.password
	});

var type = thinky.type;
var r = thinky.r;
var Errors = thinky.Errors;

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
UserMissioni.hasOne(Missioni,"missione","missionId","id");

// Query
// braccone: 1c891706-037d-402f-b564-50d1d03c356e
// 1mission: bb375656-23ca-43e5-9db0-842879154b6b
//numero missioni iniziate prova con id di braccone
User.get("1c891706-037d-402f-b564-50d1d03c356e").getJoin({userDate: true}).run().then(function(user){
	// console.log("numero di missioni iniziate braccone ", user.userDate.length);
});

//missioni completate
r.table("utenti_missioni").filter({userId: "1c891706-037d-402f-b564-50d1d03c356e"})
.hasFields("dataFine").run().then(function(missioni){
	// console.log("numero di missioni finite", missioni.length);
});

//query del punteggio totale
UserMissioni.hasFields("dataFine").filter({userId:"1c891706-037d-402f-b564-50d1d03c356e"})
.getJoin({missione: true}).run()
.then(function(usermissioni){
	// console.log(usermissioni)
	var somma =0;
	usermissioni.forEach( function(element, index) {
		somma += element.missione.punteggio;
		// console.log(element.prova.punteggio);
	});
	// console.log('somma:',somma);
});

// Per calcolare il tempo di completamento di una missione
function giorni(m){
	return Math.floor(m/(24*60*60*1000));
}
function ore(m){
	return Math.floor((m-giorni(m)*24*60*60*1000)/(60*60*1000));
}
function minuti(m){
	return Math.floor(((m-giorni(m)*24*60*60*1000)-(ore(m)*60*60*1000))/(60*1000));
}
function secondi(m){
	return Math.floor(((m-giorni(m)*24*60*60*1000)-ore(m)*60*60*1000-minuti(m)*60*1000)/1000);
}
// query per il tempo di completamento delle missione
UserMissioni.filter({userId:"1c891706-037d-402f-b564-50d1d03c356e"}).hasFields("dataFine").getJoin({missione:true}).run()
.then(function(missioni){
	// console.log(missioni);
	var tempo = new Array();
	missioni.forEach( function(element, index) {
		var ms =Math.abs(element.dataFine-element.dataInizio);
		// console.log(element.missione.titolo);
		// console.log("days:",giorni(ms));
		// console.log("hours:",ore(ms));
		// console.log("minutes:",minuti(ms));
		// console.log("seconds:",secondi(ms));
		tempo.push({
			nomeMissione:element.missione.titolo,
			giorni:giorni(ms),
			ore: ore(ms),
			minuti: minuti(ms),
			secondi: secondi(ms)
		});
	});
	// console.log(tempo);

});

Avatar.get("bb375656-23ca-43e5-9db0-842879154b6b").getJoin({useravatar: true})
	.run()
	.error(function(err) {
		console.log(err)
	});


exports.findUser = function(){
	return r.table(User.getTableName()).filter('id')
		.run().then(function(result) {
					if (result) {
						return result.toArray(); }
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

		r.table(User.getTableName()).filter(r.row('username').eq(username)).nth(0).run().then(function (user) {
			// fondamentale altrimenti non funziona un cazzo
			// user.toArray;
			if (user.length == 0) {
				console.log('sono entrato');
				return done(null, false, { message: 'Incorrect username.' });
			}
			else{

				if (!bcrypt.compareSync(password, user.password)) {

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
	done(null, user.username);
});

passport.deserializeUser(function (username, done) {
	r.table(User.getTableName()).filter(r.row('username').eq(username)).nth(0).run().then(function(user){
		done(null,user);
	})
});
