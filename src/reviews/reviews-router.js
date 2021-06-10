const path = require("path");
const express = require("express");
const xss = require("xss");
const ReviewsSerivce = require("./reviews-service");

const reviewRouter = express.Router();
const jsonParser = express.json();

const serializeReview = (review) => ({
  review_id: review.review_id,
  review_book_id: review.review_book_id,
  review_date_finished: review.review_date_finished,
  review_rating: review.review_rating,
  review_favorite: xss(review.review_favorite),
  review_dislike: xss(review.review_dislike),
  review_takeaway: xss(review.review_takeaway),
  review_notes: xss(review.review_notes),
  review_recommend: review.review_recommend,
  review_date_modified: review.review_date_modified,
});

reviewRouter.route("/").get((req, res, next) => {
  const knex = req.app.get("db");
  ReviewsSerivce.getAllReviews(knex)
    .then((reviews) => {
      res.json(reviews.map(serializeReview));
    })
    .catch(next);
});

module.exports = reviewRouter;
