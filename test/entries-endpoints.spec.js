const knex = require("knex");
const app = require("../src/app");

const {
  makeBooksArray,
  makeEntriesArray,
  makeMaliciousEntry,
  testIds,
} = require("./fixtures");

describe("/entries Endpoints", function () {
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

  describe("GET /api/entries", () => {
    context("Given no entries", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get(`/api/entries`).expect(200, []);
      });
    });

    context("Given there are entries in the database", () => {
      const testBooks = makeBooksArray();
      const testEntries = makeEntriesArray();

      beforeEach("insert test entries", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db.into("earlybird_entries").insert(testEntries);
          });
      });

      it("GET /api/entries responds with 200 and all of the entries", () => {
        return supertest(app).get(`/api/entries`).expect(200, testEntries);
      });
    });

    context("Given XSS attack content", () => {
      const testBooks = makeBooksArray();
      const testEntries = makeEntriesArray();
      const { maliciousEntry, expectedEntry } = makeMaliciousEntry();

      beforeEach("insert malicious entry", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db
              .into("earlybird_entries")
              .insert(testEntries)
              .then(() => {
                return db.into("earlybird_entries").insert([maliciousEntry]);
              });
          });
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/entries`)
          .expect(200)
          .expect((res) => {
            expect(res.body[res.body.length - 1].entry_id).to.eql(
              expectedEntry.entry_id
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].entry_book_id).to.eql(
              expectedEntry.entry_book_id
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].entry_title).to.eql(
              expectedEntry.entry_title
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].entry_category).to.eql(
              expectedEntry.entry_category
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].entry_chapters).to.eql(
              expectedEntry.entry_chapters
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].entry_pages).to.eql(
              expectedEntry.entry_pages
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].entry_quote).to.eql(
              expectedEntry.entry_quote
            );
          })
          .expect((res) => {
            expect(res.body[res.body.length - 1].entry_notes).to.eql(
              expectedEntry.entry_notes
            );
          });
      });
    });
  });

  describe("POST /api/entries/", () => {
    const testBooks = makeBooksArray();
    const testEntries = makeEntriesArray();

    beforeEach("insert test entries", () => {
      return db
        .into("earlybird_books")
        .insert(testBooks)
        .then(() => {
          return db.into("earlybird_entries").insert(testEntries);
        });
    });

    it("creates a provider, responding with 201 and the new book", () => {
      const newEntry = {
        entry_book_id: "4a3ae350-cae4-11eb-b8bc-0242ac130003",
        entry_title: "Test New Entry",
        entry_category: "Test Entry Category",
        entry_chapters: "1",
        entry_pages: "1-10",
        entry_quote: "Test Quote",
        entry_notes: "Test Entry Notes",
      };

      return supertest(app)
        .post(`/api/entries`)
        .send(newEntry)
        .expect(201)
        .expect((res) => {
          expect(res.body.entry_book_id).to.eql(newEntry.entry_book_id);
          expect(res.body.entry_title).to.eql(newEntry.entry_title);
          expect(res.body.entry_category).to.eql(newEntry.entry_category);
          expect(res.body.entry_chapters).to.eql(newEntry.entry_chapters);
          expect(res.body.entry_pages).to.eql(newEntry.entry_pages);
          expect(res.body.entry_quote).to.eql(newEntry.entry_quote);
          expect(res.body.entry_notes).to.eql(newEntry.entry_notes);
          expect(res.body).to.have.property("entry_id");
          expect(res.headers.location).to.eql(
            `/api/entries/${res.body.entry_id}`
          );
        })
        .then((postRes) =>
          supertest(app)
            .get(`/api/entries/${postRes.body.entry_id}`)
            .expect(postRes.body)
        );
    });

    // validation testing
    const requiredFields = ["entry_book_id", "entry_title", "entry_category"];

    requiredFields.forEach((field) => {
      const newEntry = {
        entry_book_id: "4a3ae350-cae4-11eb-b8bc-0242ac130003",
        entry_title: "Test New Entry",
        entry_category: "Test Entry Category",
        entry_chapters: "1",
        entry_pages: "1-10",
        entry_quote: "Test Quote",
        entry_notes: "Test Entry Notes",
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newEntry[field];

        return supertest(app)
          .post(`/api/entries`)
          .send(newEntry)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });

    it("removes XSS attack content", () => {
      const { maliciousEntry, expectedEntry } = makeMaliciousEntry();
      return supertest(app)
        .post(`/api/entries`)
        .send(maliciousEntry)
        .expect(201)
        .expect((res) => {
          expect(res.body.entry_book_id).to.eql(expectedEntry.entry_book_id);
        })
        .expect((res) => {
          expect(res.body.entry_title).to.eql(expectedEntry.entry_title);
        })
        .expect((res) => {
          expect(res.body.entry_category).to.eql(expectedEntry.entry_category);
        })
        .expect((res) => {
          expect(res.body.entry_chapters).to.eql(expectedEntry.entry_chapters);
        })
        .expect((res) => {
          expect(res.body.entry_pages).to.eql(expectedEntry.entry_pages);
        })
        .expect((res) => {
          expect(res.body.entry_quote).to.eql(expectedEntry.entry_quote);
        })
        .expect((res) => {
          expect(res.body.entry_notes).to.eql(expectedEntry.entry_notes);
        });
    });
  });

  describe("DELETE /api/entries/:entry_id", () => {
    context("Given no entries", () => {
      it("responds with 404", () => {
        const entryId = testIds.entry;
        return supertest(app)
          .delete(`/api/entries/${entryId}`)
          .expect(404, { error: { message: `Entry not found` } });
      });
    });

    context("Given there are entries in the database", () => {
      const testBooks = makeBooksArray();
      const testEntries = makeEntriesArray();

      beforeEach("insert test entries", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db.into("earlybird_entries").insert(testEntries);
          });
      });

      it("responds with 204 and removes the entry", () => {
        const idToRemove = testIds.entry; // test entry 1
        const expectedEntries = testEntries.filter(
          (entry) => entry.entry_id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/entries/${idToRemove}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/entries`).expect(expectedEntries);
          });
      });
    });
  });

  describe("DELETE /api/entries/:entry_id", () => {
    context("Given no entries", () => {
      it("responds with 404", () => {
        const entryId = testIds.entry;
        return supertest(app)
          .delete(`/api/entries/${entryId}`)
          .expect(404, { error: { message: `Entry not found` } });
      });
    });

    context("Given there are entries in the database", () => {
      const testBooks = makeBooksArray();
      const testEntries = makeEntriesArray();

      beforeEach("insert test entries", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db.into("earlybird_entries").insert(testEntries);
          });
      });

      it("responds with 204 and removes the entry", () => {
        const idToRemove = testIds.entry; // test entry 1
        const expectedEntries = testEntries.filter(
          (entry) => entry.entry_id !== idToRemove
        );

        return supertest(app)
          .delete(`/api/entries/${idToRemove}`)
          .expect(204)
          .then((res) => {
            supertest(app).get(`/api/entries`).expect(expectedEntries);
          });
      });
    });
  });

  describe("PATCH /api/entries/:entry_id", () => {
    context("Given no entries", () => {
      it("responds with 404", () => {
        const entryId = testIds.entry;
        return supertest(app)
          .patch(`/api/entries/${entryId}`)
          .expect(404, { error: { message: `Entry not found` } });
      });
    });

    context("Given there are entries in the database", () => {
      const testBooks = makeBooksArray();
      const testEntries = makeEntriesArray();

      beforeEach("insert test entries", () => {
        return db
          .into("earlybird_books")
          .insert(testBooks)
          .then(() => {
            return db.into("earlybird_entries").insert(testEntries);
          });
      });

      it("responds with 204 and updates the entry", () => {
        const idToUpdate = testIds.entry; // test entry 1
        const updatedEntry = {
          entry_book_id: "4a3ae350-cae4-11eb-b8bc-0242ac130003",
          entry_title: "Updated Entry",
          entry_category: "Updated Category",
          entry_chapters: "1",
          entry_pages: "1-10",
          entry_quote: "Updated Quote",
          entry_notes: "Updated Notes",
        };

        const expectedEntry = {
          ...testEntries[0],
          ...updatedEntry,
        };

        return supertest(app)
          .patch(`/api/entries/${idToUpdate}`)
          .send(updatedEntry)
          .expect(204)
          .then((res) => {
            supertest(app)
              .get(`/api/entries/${idToUpdate}`)
              .expect(expectedEntry);
          });
      });
    });
  });
});
