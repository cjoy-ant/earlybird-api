CREATE TABLE earlybird_entries (
  entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  entry_book_id UUID,
  entry_title TEXT NOT NULL,
  entry_category TEXT NOT NULL,
  entry_chapters TEXT NULL,
  entry_pages TEXT NULL,
  entry_quote TEXT NULL,
  entry_notes TEXT NULL,
  entry_date_modified TIMESTAMPTZ DEFAULT NOW()
);