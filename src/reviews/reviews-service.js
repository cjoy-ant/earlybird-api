const ReviewsService = {
  getAllReviews(knex) {
    return knex.select("*").from("earlybird_reviews");
  },

  getById(knex, review_id) {
    return knex
      .from("earlybird_reviews")
      .select("*")
      .where("review_id", review_id)
      .first();
  },

  deleteReview(knex, review_id) {
    return knex("earlybird_reviews").where({ review_id }).delete();
  },

  updateReview(knex, review_id, newReviewFields) {
    return knex("earlybird_reviews")
      .where({ review_id })
      .update(newReviewFields);
  },

  insertReview(knex, newReview) {
    return knex
      .insert(newReview)
      .into("earlybird_reviews")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  markBookFinished(knex, review_book_id) {
    return knex("earlybird_books")
      .where({ book_id: review_book_id })
      .update({ book_finished: true });
  },

  markBookNotFinished(knex, book_id) {
    return knex("earlybird_books")
      .where({ book_id: book_id })
      .update({ book_finished: false });
  },

  getBook(knex, review_id) {
    return knex
      .from("earlybird_reviews")
      .select("review_book_id")
      .where("review_id", review_id)
      .first();
  },
};

module.exports = ReviewsService;
