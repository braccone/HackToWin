var express = require('express');
var router = express.Router();
var api = require('../models/api');
var auth = require('../models/auth');
var path = require('path');
var fs = require('fs');

// Get Homepage
router.get('/',function (req, res, err) {
	res.cookie('prova','sonoLoggato',{maxAge: 60000});
	res.render('../login');
});

// Get Game
router.get('/game',verificaAutenticazione,function (req, res, err) {
	res.render('../game');
});
// Get home
router.get('/home',verificaAutenticazione,function (req, res, err) {
	res.render('../home');
});
// Get Profile
router.get('/profilo',verificaAutenticazione,function(req,res,err){
	api.statistiche(req.user.id,function(statistiche){
		res.render('../profilo',{stat:statistiche});
	});
	// console.log(statistiche);
	
});
router.get("/map",verificaAutenticazione,function(req, res){
	fs.readFile(path.join(__dirname,'../public/mappe/globalMap.json'), 'utf8', function (err,data) {
	if (err) {
		return console.log('errore madonnale:'+err);
    }
	res.json({ mappa: data });
	});
});

function verificaAutenticazione(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		req.flash('error_msg','Non sei loggato per visualizzare questa pagina');
		res.redirect('/login');
	}
}

module.exports = router;
