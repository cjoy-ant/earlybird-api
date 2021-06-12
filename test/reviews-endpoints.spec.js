const knex = require("knex");
const app = require("../src/app");

const {
  makeBooksArray,
  makeReviewsArray,
  makeMaliciousReview,
  testIds,
} = require("./fixtures");

describe("/reviews Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () =>
    db.raw(
      "TRUNCATE earlybird_books, earlybird_entries, earlybird_reviews RESTART IDENTITY CASCADE"
    )
  );

  afterEach("cleanup", () =>
    db.raw(
      "TRUNCATE earlybird_books, earlybird_entries, earlybird_reviews RESTART IDENTITY CASCADE"
    )
  );

  describe("GET /api/reviews", () => {
    context("Given no reviews", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get(`/api/reviews`).expect(200, []);
      });
    });

    context("Given there are reviews in the database", () => {
      const testBooks = makeBooksArray();
      const testReviews = makeReviewsArray();

      beforeEach("insert test reviews", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db.into("earlybird_reviews").insert(testReviews);
          });
      });

      it("GET /api/reviews responds with 200 and all of the entries", () => {
        return supertest(app).get(`/api/reviews`).expect(200, testReviews);
      });
    });

    context("Given XSS attack content", () => {
      const testBooks = makeBooksArray();
      const testReviews = makeReviewsArray();
      const { maliciousReview, expectedReview } = makeMaliciousReview();

      beforeEach("insert malicious review", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db
              .into("earlybird_reviews")
              .insert(testReviews)
              .then(() => {
                return db.into("earlybird_reviews").insert([maliciousReview]);
              });
          });
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/reviews`)
          .expect(200)
          .expect((res) => {
            expect(res.body[res.body.length - 1].review_book_id).to.eql(
              expectedReview.review_book_id
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].review_date_finished).to.eql(
              expectedReview.review_date_finished
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].review_rating).to.eql(
              expectedReview.review_rating
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].review_favorite).to.eql(
              expectedReview.review_favorite
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].review_dislike).to.eql(
              expectedReview.review_dislike
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].review_takeaway).to.eql(
              expectedReview.review_takeaway
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].review_notes).to.eql(
              expectedReview.review_notes
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].review_recommend).to.eql(
              expectedReview.review_recommend
            );
          });
      });
    });
  });

  describe("POST /api/reviews/", () => {
    const testBooks = makeBooksArray();
    const testReviews = makeReviewsArray();

    beforeEach("insert test reviews", () => {
      return db
        .into("earlybird_books")
        .insert(testBooks)
        .then(() => {
          return db.into("earlybird_reviews").insert(testReviews);
        });
    });

    it("creates a provider, responding with 201 and the new book", () => {
      const newReview = {
        review_book_id: "54703712-cae4-11eb-b8bc-0242ac130003",
        review_date_finished: "2021-06-11",
        review_rating: "5",
        review_favorite: "Test Review Favorite",
        review_dislike: "Test Review Dislike",
        review_takeaway: "Test Review Takeaway",
        review_notes: "Test Review Notes",
        review_recommend: false,
      };

      return supertest(app)
        .post(`/api/reviews`)
        .send(newReview)
        .expect(201)
        .expect((res) => {
          expect(res.body.review_book_id).to.eql(newReview.review_book_id);
          expect(res.body.review_date_finished).to.eql(
            newReview.review_date_finished
          );
          expect(res.body.review_rating).to.eql(newReview.review_rating);
          expect(res.body.review_favorite).to.eql(newReview.review_favorite);
          expect(res.body.review_dislike).to.eql(newReview.review_dislike);
          expect(res.body.review_takeaway).to.eql(newReview.review_takeaway);
          expect(res.body.review_notes).to.eql(newReview.review_notes);
          expect(res.body.review_recommend).to.eql(newReview.review_recommend);
          expect(res.body).to.have.property("review_id");
          expect(res.headers.location).to.eql(
            `/api/reviews/${res.body.review_id}`
          );
        })
        .then((postRes) =>
          supertest(app)
            .get(`/api/reviews/${postRes.body.review_id}`)
            .expect(postRes.body)
        );
    });

    // validation testing
    const requiredFields = [
      "review_book_id",
      "review_rating",
      "review_recommend",
    ];

    requiredFields.forEach((field) => {
      const newReview = {
        review_book_id: "54703712-cae4-11eb-b8bc-0242ac130003",
        review_date_finished: "2021-06-11",
        review_rating: "5",
        review_favorite: "Test Review Favorite",
        review_dislike: "Test Review Dislike",
        review_takeaway: "Test Review Takeaway",
        review_notes: "Test Review Notes",
        review_recommend: false,
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newReview[field];

        return supertest(app)
          .post(`/api/reviews`)
          .send(newReview)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });

    it("removes XSS attack content", () => {
      const { maliciousReview, expectedReview } = makeMaliciousReview();
      return supertest(app)
        .post(`/api/reviews`)
        .send(maliciousReview)
        .expect(201)
        .expect((res) => {
          expect(res.body.review_book_id).to.eql(expectedReview.review_book_id);
        })
        .expect((res) => {
          expect(res.body.review_date_finished).to.eql(
            expectedReview.review_date_finished
          );
        })
        .expect((res) => {
          expect(res.body.review_rating).to.eql(expectedReview.review_rating);
        })
        .expect((res) => {
          expect(res.body.review_favorite).to.eql(
            expectedReview.review_favorite
          );
        })
        .expect((res) => {
          expect(res.body.review_dislike).to.eql(expectedReview.review_dislike);
        })
        .expect((res) => {
          expect(res.body.review_takeaway).to.eql(
            expectedReview.review_takeaway
          );
        })
        .expect((res) => {
          expect(res.body.review_notes).to.eql(expectedReview.review_notes);
        })
        .expect((res) => {
          expect(res.body.review_recommend).to.eql(
            expectedReview.review_recommend
          );
        });
    });
  });

  describe("DELETE /api/reviews/:review_id", () => {
    context("Given no reviews", () => {
      it("responds with 404", () => {
        const reviewId = testIds.review;
        return supertest(app)
          .delete(`/api/reviews/${reviewId}`)
          .expect(404, { error: { message: `Review not found` } });
      });
    });

    context("Given there are reviews in the database", () => {
      const testBooks = makeBooksArray();
      const testReviews = makeReviewsArray();

      beforeEach("insert test reviews", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db.into("earlybird_reviews").insert(testReviews);
          });
      });

      it("responds with 204 and removes the note", () => {
        const idToRemove = testIds.review; // test review 1
        const expectedReviews = testReviews.filter(
          (review) => review.review_id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/reviews/${idToRemove}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/reviews`).expect(expectedReviews);
          });
      });
    });
  });

  describe("DELETE /api/reviews/:review_id", () => {
    context("Given no reviews", () => {
      it("responds with 404", () => {
        const reviewId = testIds.review;
        return supertest(app)
          .delete(`/api/reviews/${reviewId}`)
          .expect(404, { error: { message: `Review not found` } });
      });
    });

    context("Given there are reviews in the database", () => {
      const testBooks = makeBooksArray();
      const testReviews = makeReviewsArray();

      beforeEach("insert test reviews", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db.into("earlybird_reviews").insert(testReviews);
          });
      });

      it("responds with 204 and removes the note", () => {
        const idToRemove = testIds.review; // test review 1
        const expectedReviews = testReviews.filter(
          (review) => review.review_id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/reviews/${idToRemove}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/reviews`).expect(expectedReviews);
          });
      });
    });
  });

  describe("PATCH /api/reviews/:review_id", () => {
    context("Given no reviews", () => {
      it("responds with 404", () => {
        const reviewId = testIds.review;
        return supertest(app)
          .patch(`/api/reviews/${reviewId}`)
          .expect(404, { error: { message: `Review not found` } });
      });
    });

    context("Given there are reviews in the database", () => {
      const testBooks = makeBooksArray();
      const testReviews = makeReviewsArray();

      beforeEach("insert test reviews", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db.into("earlybird_reviews").insert(testReviews);
          });
      });

      it("responds with 204 and updates the book", () => {
        const idToUpdate = testIds.review; // test review 1
        const updatedReview = {
          review_book_id: "54703712-cae4-11eb-b8bc-0242ac130003",
          review_date_finished: "2021-06-11",
          review_rating: "5",
          review_favorite: "Updated Review Favorite",
          review_dislike: "Updated Review Dislike",
          review_takeaway: "Updated Review Takeaway",
          review_notes: "Updated Review Notes",
          review_recommend: false,
        };

        const expectedReview = {
          ...testReviews[0],
          ...updatedReview,
        };

        return supertest(app)
          .patch(`/api/reviews/${idToUpdate}`)
          .send(updatedReview)
          .expect(204)
          .then((res) => {
            supertest(app)
              .get(`/api/reviews/${idToUpdate}`)
              .expect(expectedReview);
          });
      });
    });
  });
});
