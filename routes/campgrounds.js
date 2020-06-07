const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');

//FUNCTIONCALLS AND DECLARATIONS
const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};

// INDEX ROUTE - DISPLAY ALL CAMPGROUNDS
router.get('/campgrounds', (req, res) => {
	//
	//Get all campgrounds from Database
	Campground.find({}, (err, allCampgrounds) => {
		if (err) {
			console.log('ERROR!!');
			console.log(err);
		} else {
			res.render('campgrounds/index', {campgrounds: allCampgrounds, currentUser: req.user});
		}
	});
});

router.post('/campgrounds', isLoggedIn, (req, res) => {
	//get data from form and add to campgrounds array
	const name = req.body.name;
	const image = req.body.image;
	const description = req.body.description;
	let author = {
		id: req.user._id,
		username: req.user.username,
	};
	let newCampground = {name: name, image: image, description: description, author: author};
	//Create new campground and add it to database
	Campground.create(newCampground, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
			console.log(campground);
			//redirect back to campgrounds page
			res.redirect('/campgrounds');
		}
	});
});

//NEW ROUTE - DISPLAY FORM
router.get('/campgrounds/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

//SHOW ROUTE
router.get('/campgrounds/:id', (req, res) => {
	//find campground with provided ID
	Campground.findById(req.params.id)
		.populate('comments')
		.exec((err, foundCampground) => {
			if (err) {
				console.log(err);
			} else {
				//Render Show template with that campground
				res.render('campgrounds/show', {campground: foundCampground});
			}
		});
});

module.exports = router;
