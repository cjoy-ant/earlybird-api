require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { NODE_ENV, CLIENT_ORIGIN, LOCAL_CLIENT } = require("./config");
const errorHandler = require("./error-handler");
const booksRouter = require("./books/books-router");
const entryRouter = require("./entries/entries-router");
const reviewRouter = require("./reviews/reviews-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(
  cors({
    origin: [CLIENT_ORIGIN, LOCAL_CLIENT],
  })
);

app.use("/api/books", booksRouter);
app.use("/api/entries", entryRouter);
app.use("/api/reviews", reviewRouter);

app.use(errorHandler);

module.exports = app;
