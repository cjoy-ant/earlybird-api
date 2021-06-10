const path = require("path");
const express = require("express");
const xss = require("xss");
const EntriesService = require("./entries-service");

const entryRouter = express.Router();
const jsonParser = express.json();

const serializeEntry = (entry) => ({
  entry_id: entry.entry_id,
  entry_book_id: entry.entry_book_id,
  entry_title: xss(entry.entry_title),
  entry_category: xss(entry.entry_category),
  entry_chapters: xss(entry.entry_chapters),
  entry_pages: xss(entry.entry_pages),
  entry_quote: xss(entry.entry_quote),
  entry_notes: xss(entry.entry_notes),
  entry_date_modified: entry.entry_date_modified,
});

entryRouter.route("/").get((req, res, next) => {
  const knex = req.app.get("db");
  EntriesService.getAllEntries(knex)
    .then((entries) => {
      res.json(entries.map((entry) => serializeEntry(entry)));
    })
    .catch(next);
});

module.exports = entryRouter;
