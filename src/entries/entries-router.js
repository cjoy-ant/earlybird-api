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

entryRouter
  .route("/")
  .get((req, res, next) => {
    const knex = req.app.get("db");
    EntriesService.getAllEntries(knex)
      .then((entries) => {
        res.json(entries.map(serializeEntry));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const {
      entry_book_id,
      entry_title,
      entry_category,
      entry_chapters,
      entry_pages,
      entry_quote,
      entry_notes,
    } = req.body;
    const newEntry = {
      entry_book_id,
      entry_title,
      entry_category,
      entry_chapters,
      entry_pages,
      entry_quote,
      entry_notes,
    };
    const knex = req.app.get("db");

    for (const [key, value] of Object.entries(newEntry)) {
      if (
        key !== "entry_chapters" &&
        key !== "entry_pages" &&
        key !== "entry_quote" &&
        key !== "entry_note" &&
        value == null
      ) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }
    EntriesService.insertEntry(knex, newEntry)
      .then((entry) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${entry.entry_id}`))
          .json(serializeEntry(entry));
      })
      .catch(next);
  });
entryRouter
  .route("/:entry_id")
  .all((req, res, next) => {
    const knex = req.app.get("db");
    EntriesService.getById(knex, req.params.entry_id)
      .then((entry) => {
        if (!entry) {
          return res.status(404).json({
            error: { message: `Entry not found` },
          });
        }
        res.entry = entry;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      entry_id: res.entry.entry_id,
      entry_book_id: res.entry.entry_book_id,
      entry_title: xss(res.entry.bentry_title),
      entry_category: xss(res.entry.entry_category),
      entry_chapters: xss(res.entry.entry_chapters),
      entry_pages: xss(res.entry.entry_pages),
      entry_quote: xss(res.entry.entry_quote),
      entry_notes: xss(res.entry.entry_notes),
      entry_date_modified: res.entry.entry_date_modified,
    });
  });

module.exports = entryRouter;
