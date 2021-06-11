const path = require("path");
const express = require("express");
const xss = require("xss");
const ReviewsService = require("./reviews-service");
const { getBook } = require("./reviews-service");

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

reviewRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    ReviewsService.getAllReviews(knex)
      .then((reviews) => {
        res.json(reviews.map(serializeReview));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const {
      review_book_id,
      review_date_finished,
      review_rating,
      review_favorite,
      review_dislike,
      review_takeaway,
      review_notes,
      review_recommend,
    } = req.body;
    const newReview = {
      review_book_id,
      review_date_finished,
      review_rating,
      review_favorite,
      review_dislike,
      review_takeaway,
      review_notes,
      review_recommend,
    };
    const knex = req.app.get("db");

    for (const [key, value] of Object.entries(newReview)) {
      if (
        key !== "review_favorite" &&
        key !== "review_dislike" &&
        key !== "review_takeaway" &&
        key !== "review_notes" &&
        value == null
      ) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }
    ReviewsService.markBookFinished(knex, review_book_id).then(
      ReviewsService.insertReview(knex, newReview)
        .then((review) => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${review.review_id}`))
            .json(serializeReview(review));
        })
        .catch(next)
    );
  });
reviewRouter
  .route("/:review_id")
  .all((req, res, next) => {
    const knex = req.app.get("db");
    ReviewsService.getById(knex, req.params.review_id)
      .then((review) => {
        if (!review) {
          return res.status(404).json({
            error: { message: `Review not found` },
          });
        }
        res.review = review;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      review_id: res.review.review_id,
      review_book_id: res.review.review_book_id,
      review_date_finished: res.review.review_date_finished,
      review_rating: res.review.review_rating,
      review_favorite: xss(res.review.review_favorite),
      review_dislike: xss(res.review.review_dislike),
      review_takeaway: xss(res.review.review_takeaway),
      review_notes: xss(res.review.review_notes),
      review_recommend: res.review.review_recommend,
      review_date_modified: res.review.review_date_modified,
    });
  })
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    ReviewsService.getBook(knex, req.params.review_id).then((review) => {
      ReviewsService.markBookNotFinished(knex, review.review_book_id).then(
        ReviewsService.deleteReview(knex, req.params.review_id)
          .then(() => {
            res.status(204).end();
          })
          .catch(next)
      );
    });
  });

module.exports = reviewRouter;
