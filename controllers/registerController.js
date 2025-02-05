'use strict';

const controller = {};
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { sanitizeInput } = require('./shared');


controller.show = async (req, res) => {
	
	res.render('register', {
		title: 'GeoSI - Register',
        display: 'display-none'
	});
};

controller.register = async (req, res) => {
	const { 'name': NameBody, email, password} = req.body;
	try {
		const name = sanitizeInput(NameBody);

		let account = await userModel.findOne({ Email: email });
		if (account) {
		req.flash('error_msg', 'Email already exists');
		return res.redirect('/register');
		}
		const hashedPassword = await bcrypt.hash(password, 10);
  
		const newUser = new userModel({
			Name: name,
			Avatar: "/images/default-user-image.png",
			Email: email,
			Password: hashedPassword,
		});
  
		await newUser.save();
		req.flash('success_msg', 'You are registered and can now login');
	
		res.redirect('/login');
	} catch (error) {
	  console.error(error);
	  req.flash('error_msg', 'Something went wrong. Please try again.');
	  res.redirect('/register');
	}
  };


module.exports = controller;
