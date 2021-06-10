const path = require("path");
const express = require("express");
const xss = require("xss");
const BooksService = require("./books-service");

const booksRouter = express.Router();
const jsonParser = express.json();

const serializeBook = (book) => ({
  book_id: book.book_id,
  book_title: xss(book.book_title),
  book_author: xss(book.book_author),
  book_genre: xss(book.book_genre),
  book_date_started: book.book_date_started,
  book_finished: book.book_finished,
  book_date_modified: book.book_date_modified,
});

booksRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    BooksService.getAllBooks(knex)
      .then((books) => {
        res.json(books);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { book_title, book_author, book_genre, book_date_started } = req.body;
    const newBook = {
      book_title,
      book_author,
      book_genre,
      book_date_started,
    };
    const knex = req.app.get("db");

    for (const [key, value] of Object.entries(newBook)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    BooksService.insertBook(knex, newBook)
      .then((book) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${book.book_id}`))
          .json(serializeBook(book));
      })
      .catch(next);
  });

booksRouter
  .route("/:book_id")
  .all((req, res, next) => {
    const knex = req.app.get("db");
    BooksService.getById(knex, req.params.book_id)
      .then((book) => {
        if (!book) {
          return res.status(404).json({
            error: { message: `Book not found` },
          });
        }
        res.book = book;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      book_id: res.book.book_id,
      book_title: xss(res.book.book_title),
      book_author: xss(res.book.book_author),
      book_genre: xss(res.book.book_genre),
      book_date_started: res.book.book_date_started,
      book_finished: res.book.book_finished,
      book_date_modified: res.book.book_date_modified,
    });
  })
  .delete((req, res, next) => {
    const knex = req.app.get("db");
    BooksService.deleteBook(knex, req.params.book_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { book_title, book_author, book_genre, book_date_started } = req.body;
    const bookToUpdate = {
      book_title,
      book_author,
      book_genre,
      book_date_started,
    };

    const numberOfValues = Object.values(bookToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain the following: book_title, book_author, book_genre, book_date_started.`,
        },
      });
    }

    const knex = req.app.get("db");
    BooksService.updateBook(knex, req.params.book_id, bookToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = booksRouter;
