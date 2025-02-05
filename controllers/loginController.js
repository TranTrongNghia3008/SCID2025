'use strict';

const controller = {};
const passport = require('passport');


controller.show = async (req, res) => {
	const errorMessages = req.flash('error');
	
	res.render('login', {
		title: 'GeoSI - Login',
        display: 'display-none',
        // btnLogin: 'btn-login',
		errorMessages
	});
};

controller.login = (req, res, next) => {
	passport.authenticate('local', {
	  successRedirect: '/q-and-a',
	  failureRedirect: '/login',
	  failureFlash: true
	})(req, res, next);
};


module.exports = controller;
