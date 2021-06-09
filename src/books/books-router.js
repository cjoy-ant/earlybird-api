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

booksRouter.route("/").get((req, res, next) => {
  const knex = req.app.get("db");
  BooksService.getAllBooks(knex)
    .then((books) => {
      res.json(books);
    })
    .catch(next);
});

module.exports = booksRouter;
