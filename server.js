var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// var r = require('rethinkdb');
var expressLayouts = require("express-ejs-layouts");
//Connessione database rethinkdb
// var configDB = require(__dirname + '/config.js');
// var connection = r.connect(configDB);

var routes = require('./routes/index');
var users = require('./routes/users');

// Inizializzazione dell'applicazione
var app = express();
var server = require('http').Server(app);
app.use(expressLayouts);
// Motore dei template
// app.set('views', path.join(__dirname,'views'));
// app.engine('handlebars',exphbs({defaultLayout:'layout'}));
// app.set('view engine','handlebars');
app.set('views', path.join(__dirname, '/views/layouts'));
// app.set('view options', { layout:'layouts/layout.ejs' });
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));

// Settare la cartella pubblica
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
	cookie: { maxAge: 30 * 60 * 1000 },
	secret: 'secret',
	saveUninitialized: true,
	resave: true,
	rolling: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.'),
			root = namespace.shift(),
			formParam = root;

		while (namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
})

app.use('/', routes);
app.use('/', users);
app.use(function(req, res) {
	res.status(400);
	res.sendFile(__dirname + '/views/404.html');
});

// Set the port
app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'), function() {
	console.log('Server started on port ' + app.get('port'));
})


// Set server socket for the game
var io = require('socket.io')(server);
io.on('connection', function(socket) {
	console.log('client connected');
	socket.on('happy', function() {
		console.log('happy');
	});
});
