const knex = require("knex");
const app = require("../src/app");

const { makeBooksArray, makeMaliciousBook, testIds } = require("./fixtures");

describe("/books Endpoints", function () {
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

  describe("GET /api/books", () => {
    context("Given no books", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get(`/api/books`).expect(200, []);
      });
    });

    context("Given there are books in the database", () => {
      const testBooks = makeBooksArray();

      beforeEach("insert test books", () => {
        return db.into("earlybird_books").insert(testBooks);
      });

      it("GET /api/books responds with 200 and all of the books", () => {
        return supertest(app).get(`/api/books`).expect(200, testBooks);
      });
    });

    context("Given XSS attack content", () => {
      const testBooks = makeBooksArray();
      const { maliciousBook, expectedBook } = makeMaliciousBook();

      beforeEach("insert malicious book", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db.into("earlybird_books").insert([maliciousBook]);
          });
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/books`)
          .expect(200)
          .expect((res) => {
            expect(res.body[res.body.length - 1].book_id).to.eql(
              expectedBook.book_id
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].book_title).to.eql(
              expectedBook.book_title
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].book_author).to.eql(
              expectedBook.book_author
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].book_genre).to.eql(
              expectedBook.book_genre
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].book_date_started).to.eql(
              expectedBook.book_date_started
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].book_finished).to.eql(
              expectedBook.book_finished
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].book_date_modified).to.eql(
              expectedBook.book_date_modified
            );
          });
      });
    });
  });
});
