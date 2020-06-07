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

const campgroundRoutes = require('./routes/campgrounds'),
	commentRoutes = require('./routes/comments'),
	indexRoutes = require('./routes/index');

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
// seedDB();

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

//Requiring Routes
app.use(campgroundRoutes);
app.use(commentRoutes);
app.use(indexRoutes);

app.listen(3000, () => {
	console.log('Yelp Camp Server has started');
});
