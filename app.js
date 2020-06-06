const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	Campground = require('./models/campground'),
	Comment = require('./models/comment'),
	seedDB = require('./seeds'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	User = require('./models/user');

mongoose
	.connect('mongodb://localhost/yelp_camp', {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => console.log('Connected to Database!!'))
	.catch((err) => console.log("Couldn't connect to database", err));

//FUNCTIONCALLS AND DECLARATIONS
const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};
//Seed database with starter data
seedDB();

//PASSPORT CONFIG
app.use(
	require('express-session')({
		secret: 'I love Arielle so much',
		resave: false,
		saveUninitialized: false,
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
	res.render('landing');
});

// INDEX ROUTE - DISPLAY ALL CAMPGROUNDS
app.get('/campgrounds', (req, res) => {
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

app.post('/campgrounds', (req, res) => {
	//get data from form and add to campgrounds array
	const name = req.body.name;
	const image = req.body.image;
	const description = req.body.description;
	let newCampground = {name: name, image: image, description: description};
	//Create new campground and add it to database
	Campground.create(newCampground, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
			//redirect back to campgrounds page
			res.redirect('/campgrounds');
		}
	});
});

//NEW ROUTE - DISPLAY FORM
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

//SHOW ROUTE
app.get('/campgrounds/:id', (req, res) => {
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

//=============================
//COMMENT ROUTES
//=============================

//NEW ROUTE - SHOW FORM
app.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
			res.render('comments/new', {campground: campground});
		}
	});
});

//NEW ROUTE POST
app.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
	//find the respective campground in th DB
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
			res.redirect('/campgrounds');
		} else {
			//create new comment
			Comment.create(req.body.comment, (err, comment) => {
				if (err) {
					console.log(err);
				} else {
					//connect new comment to campground
					campground.comments.push(comment);
					campground.save();
					res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	});
});

//=============================
//AUTH ROUTES
//=============================

//show register form
app.get('/register', (req, res) => {
	res.render('register');
});

//handle sign up logic
app.post('/register', (req, res) => {
	User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render('register');
		} else {
			passport.authenticate('local')(req, res, () => {
				res.redirect('/campgrounds');
			});
		}
	});
});

//show login form
app.get('/login', (req, res) => {
	res.render('login');
});

//handle login logic
app.post('/login', passport.authenticate('local', {successRedirect: '/campgrounds', failureRedirect: '/login'}), (req, res) => {});

//handle logout logic
app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/campgrounds');
});

app.listen(3000, () => {
	console.log('Yelp Camp Server has started');
});
