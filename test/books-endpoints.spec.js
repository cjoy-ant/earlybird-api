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

  describe("POST /api/books/", () => {
    const testBooks = makeBooksArray();

    beforeEach("insert test books", () => {
      return db.into("earlybird_books").insert(testBooks);
    });

    it("creates a provider, responding with 201 and the new book", () => {
      const newBook = {
        book_title: "Test New Book",
        book_author: "Test New Author",
        book_genre: "Test New Genre",
        book_date_started: "2021-06-11",
      };

      return supertest(app)
        .post(`/api/books`)
        .send(newBook)
        .expect(201)
        .expect((res) => {
          expect(res.body.book_title).to.eql(newBook.book_title);
          expect(res.body.book_author).to.eql(newBook.book_author);
          expect(res.body.book_genre).to.eql(newBook.book_genre);
          expect(res.body.book_date_started).to.eql(newBook.book_date_started);
          expect(res.body).to.have.property("book_id");
          expect(res.headers.location).to.eql(`/api/books/${res.body.book_id}`);
        })
        .then((postRes) =>
          supertest(app)
            .get(`/api/books/${postRes.body.book_id}`)
            .expect(postRes.body)
        );
    });

    // validation testing
    const requiredFields = [
      "book_title",
      "book_author",
      "book_genre",
      "book_date_started",
    ];

    requiredFields.forEach((field) => {
      const newBook = {
        book_title: "Test New Book",
        book_author: "Test New Author",
        book_genre: "Test New Genre",
        book_date_started: "2021-06-11",
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newBook[field];

        return supertest(app)
          .post(`/api/books`)
          .send(newBook)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });

    it("removes XSS attack content", () => {
      const { maliciousBook, expectedBook } = makeMaliciousBook();
      return supertest(app)
        .post(`/api/books`)
        .send(maliciousBook)
        .expect(201)
        .expect((res) => {
          expect(res.body.book_title).to.eql(expectedBook.book_title);
        })
        .expect((res) => {
          expect(res.body.book_author).to.eql(expectedBook.book_author);
        })
        .expect((res) => {
          expect(res.body.book_genre).to.eql(expectedBook.book_genre);
        })
        .expect((res) => {
          expect(res.body.book_date_started).to.eql(
            expectedBook.book_date_started
          );
        });
    });
  });

  describe("DELETE /api/books/:book_id", () => {
    context("Given no books", () => {
      it("responds with 404", () => {
        const bookId = testIds.book;
        return supertest(app)
          .delete(`/api/books/${bookId}`)
          .expect(404, { error: { message: `Book not found` } });
      });
    });

    context("Given there are books in the database", () => {
      const testBooks = makeBooksArray();

      beforeEach("insert test books", () => {
        return db.into("earlybird_books").insert(testBooks);
      });

      it("responds with 204 and removes the note", () => {
        const idToRemove = testBooks[1].book_id; // test book 1
        const expectedBooks = testBooks.filter(
          (book) => book.book_id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/books/${idToRemove}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/books`).expect(expectedBooks);
          });
      });
    });
  });

  describe("DELETE /api/books/:book_id", () => {
    context("Given no books", () => {
      it("responds with 404", () => {
        const bookId = testIds.book;
        return supertest(app)
          .delete(`/api/books/${bookId}`)
          .expect(404, { error: { message: `Book not found` } });
      });
    });

    context("Given there are books in the database", () => {
      const testBooks = makeBooksArray();

      beforeEach("insert test books", () => {
        return db.into("earlybird_books").insert(testBooks);
      });

      it("responds with 204 and removes the note", () => {
        const idToRemove = testIds.book; // test book 1
        const expectedBooks = testBooks.filter(
          (book) => book.book_id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/books/${idToRemove}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/books`).expect(expectedBooks);
          });
      });
    });
  });
});
