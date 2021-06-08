CREATE TABLE IF NOT EXISTS earlybird_reviews (
  review_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  review_book_id UUID,
  review_date_finished TEXT NOT NULL,
  review_rating TEXT NOT NULL,
  review_favorite TEXT NULL,
  review_dislike TEXT NULL,
  review_takeaway TEXT NULL,
  review_notes TEXT NULL,
  review_recommend BOOLEAN NOT NULL,
  review_date_modified TIMESTAMPTZ DEFAULT NOW()
);