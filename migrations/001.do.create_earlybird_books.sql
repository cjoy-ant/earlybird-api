CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE earlybird_books (
  book_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  book_title TEXT NOT NULL,
  book_author TEXT NOT NULL,
  book_genre TEXT NOT NULL,
  book_date_started TEXT NOT NULL,
  book_finished BOOLEAN,
  book_date_modified TIMESTAMPTZ DEFAULT NOW()
);