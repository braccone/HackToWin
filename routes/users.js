var express = require('express');
var router = express.Router();
// var bcrypt = require('bcryptjs');
var User = require('../models/user');
var api = require('../models/api');
var auth = require('../models/auth');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
// Register
router.get('/register',function (req, res) {
	res.render('../register');
});

// Login
router.get('/login',function (req, res) {
	res.render('../login');
});

// Register user
router.post('/register',api.addUser);



// Login user
router.post('/login',passport.authenticate('local',{successRedirect:'/home',failureRedirect:'/login',failureFlash: true}),
	function (req, res, next) {

	var username = req.body.username;
	var password = req.body.password;
	req.checkBody('username','Username errato.').notEmpty();
	req.checkBody('password','Password errata.').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('login',{
			errors:errors
		});
	}
});

router.get('/logout', function(req,res){
	req.logout();
	req.flash('success_msg', 'Log-out avvenuto con successo');
	res.redirect('/login');
});

module.exports = router;
