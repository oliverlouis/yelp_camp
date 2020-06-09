const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');

//=============================
//MIDDLEWARE FUNCTIONS
//=============================
const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};

const checkCommentOwnership = (req, res, next) => {
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if (err) {
				res.redirect('/campgrounds');
			} else {
				if (foundComment.author.id.equals(req.user._id)) {
					next();
				} else {
					res.redirect('back');
				}
			}
		});
	} else {
		res.redirect('back');
	}
};

//=============================
//COMMENT ROUTES
//=============================

//NEW ROUTE - SHOW FORM
router.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			console.log(err);
		} else {
			res.render('comments/new', {campground: campground});
		}
	});
});

//NEW ROUTE POST
router.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
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
					//add username and id to comment and save
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					//connect new comment to campground
					campground.comments.push(comment);
					campground.save();
					res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	});
});

//UPDATE COMMENTS ROUTES

//SHOW EDIT FORM
router.get('/campgrounds/:id/comments/:comment_id/edit', checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if (err) {
			res.redirect('back');
		} else {
			res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
		}
	});
});

//HANDLE UPDATE
router.put('/campgrounds/:id/comments/:comment_id', checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if (err) {
			res.redirect('back');
		} else {
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

//DELETE COMMENT ROUTE
router.delete('/campgrounds/:id/comments/:comment_id', checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if (err) {
			res.redirect('back');
		} else {
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

module.exports = router;
