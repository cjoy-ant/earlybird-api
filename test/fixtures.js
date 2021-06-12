function makeBooksArray() {
  return [
    {
      book_id: "4a3ae350-cae4-11eb-b8bc-0242ac130003",
      book_title: "Test Book 1",
      book_author: "Test Author 1",
      book_genre: "Test Genre 1",
      book_date_started: "2021-06-01",
      book_finished: true,
      book_date_modified: "2021-06-01T16:24:02.922Z",
    },
    {
      book_id: "521a78f6-cae4-11eb-b8bc-0242ac130003",
      book_title: "Test Book 2",
      book_author: "Test Author 2",
      book_genre: "Test Genre 2",
      book_date_started: "2021-06-02",
      book_finished: true,
      book_date_modified: "2021-06-02T16:24:02.922Z",
    },
    {
      book_id: "54703712-cae4-11eb-b8bc-0242ac130003",
      book_title: "Test Book 3",
      book_author: "Test Author 3",
      book_genre: "Test Genre 3",
      book_date_started: "2021-06-03",
      book_finished: false,
      book_date_modified: "2021-06-03T16:24:02.922Z",
    },
  ];
}

function makeEntriesArray() {
  return [
    {
      entry_id: "b88913c2-cae4-11eb-b8bc-0242ac130003",
      entry_book_id: "4a3ae350-cae4-11eb-b8bc-0242ac130003",
      entry_title: "Test Entry 1",
      entry_category: "Quote",
      entry_chapters: "1",
      entry_pages: "1-10",
      entry_quote: "Hello this is a test quote",
      entry_notes: "",
      entry_date_modified: "2021-06-01T20:24:02.922Z",
    },
    {
      entry_id: "bb1bc738-cae4-11eb-b8bc-0242ac130003",
      entry_book_id: "521a78f6-cae4-11eb-b8bc-0242ac130003",
      entry_title: "Test Entry 2",
      entry_category: "Note",
      entry_chapters: "2",
      entry_pages: "2-20",
      entry_quote: "",
      entry_notes: "Hello this is a test note",
      entry_date_modified: "2021-06-02T20:24:02.922Z",
    },
    {
      entry_id: "cf970d44-cae4-11eb-b8bc-0242ac130003",
      entry_book_id: "54703712-cae4-11eb-b8bc-0242ac130003",
      entry_title: "Test Entry 3",
      entry_category: "Note",
      entry_chapters: "3",
      entry_pages: "5-15",
      entry_quote: "Hello this is a test Quote",
      entry_notes: "Hello this is a test note",
      entry_date_modified: "2021-06-03T20:24:02.922Z",
    },
  ];
}

function makeReviewsArray() {
  return [
    {
      review_id: "8f46731e-cb17-11eb-b8bc-0242ac130003",
      review_book_id: "4a3ae350-cae4-11eb-b8bc-0242ac130003",
      review_date_finished: "2021-06-07",
      review_rating: "7",
      review_favorite: "This is my favorite thing about Test Book 1",
      review_dislike: "This is my least favorite",
      review_takeaway: "This is what I took away from this book",
      review_notes: "Test notes",
      review_recommend: true,
      review_date_modified: "2021-06-07T10:24:02.922Z",
    },
    {
      review_id: "a8a9b104-cb17-11eb-b8bc-0242ac130003",
      review_book_id: "521a78f6-cae4-11eb-b8bc-0242ac130003",
      review_date_finished: "2021-06-10",
      review_rating: "2",
      review_favorite: "This is my favorite thing about Test Book 2",
      review_dislike: "This is my least favorite",
      review_takeaway: "This is what I took away from this book",
      review_notes: "Test notes",
      review_recommend: false,
      review_date_modified: "2021-06-10T10:24:02.922Z",
    },
  ];
}

function makeMaliciousBook() {
  const maliciousBook = {
    book_id: "2973a2d6-cb18-11eb-b8bc-0242ac130003",
    book_title: 'BAD <script>alert("xss");</script>',
    book_author: 'BAD <script>alert("xss");</script>',
    book_genre: 'BAD <script>alert("xss");</script>',
    book_date_started: "2021-06-01",
    book_finished: true,
    book_date_modified: new Date().toISOString(),
  };

  const expectedBook = {
    ...maliciousBook,
    book_id: "2973a2d6-cb18-11eb-b8bc-0242ac130003",
    book_title: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    book_author: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    book_genre: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    book_date_started: "2021-06-01",
    book_finished: true,
  };
  return { maliciousBook, expectedBook };
}

function makeMaliciousEntry() {
  const maliciousEntry = {
    entry_id: "bb1bc738-cae4-11eb-b8bc-0242ac130003",
    entry_book_id: "2973a2d6-cb18-11eb-b8bc-0242ac130003",
    entry_title: 'BAD <script>alert("xss");</script>',
    entry_category: 'BAD <script>alert("xss");</script>',
    entry_chapters: 'BAD <script>alert("xss");</script>',
    entry_pages: 'BAD <script>alert("xss");</script>',
    entry_quote: 'BAD <script>alert("xss");</script>',
    entry_notes: 'BAD <script>alert("xss");</script>',
    entry_date_modified: new Date().toISOString(),
  };

  const expectedEntry = {
    ...maliciousEntry,
    entry_id: "bb1bc738-cae4-11eb-b8bc-0242ac130003",
    entry_book_id: "2973a2d6-cb18-11eb-b8bc-0242ac130003",
    entry_title: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    entry_category: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    entry_chapters: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    entry_pages: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    entry_quote: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    entry_notes: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
  };
  return { maliciousEntry, expectedEntry };
}

function makeMaliciousReview() {
  const maliciousReview = {
    review_id: "be7a8606-cb18-11eb-b8bc-0242ac130003",
    review_book_id: "2973a2d6-cb18-11eb-b8bc-0242ac130003",
    review_date_finished: "2021-06-07",
    review_rating: "0",
    review_favorite: 'BAD <script>alert("xss");</script>',
    review_dislike: 'BAD <script>alert("xss");</script>',
    review_takeaway: 'BAD <script>alert("xss");</script>',
    review_notes: 'BAD <script>alert("xss");</script>',
    review_recommend: false,
    review_date_modified: new Date().toISOString(),
  };

  const expectedReview = {
    ...maliciousReview,
    review_id: "be7a8606-cb18-11eb-b8bc-0242ac130003",
    review_book_id: "2973a2d6-cb18-11eb-b8bc-0242ac130003",
    review_date_finished: "2021-06-07",
    review_rating: "0",
    review_favorite: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    review_dislike: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    review_takeaway: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    review_notes: 'BAD &lt;script&gt;alert("xss");&lt;/script&gt;',
    review_recommend: false,
  };

  return { maliciousReview, expectedReview };
}

const newBook = {
  book_title: "Test New Book",
  book_author: "Test New Author",
  book_genre: "Test New Genre",
  book_date_started: "2021-06-11",
};

const newEntry = {
  entry_book_id: "4a3ae350-cae4-11eb-b8bc-0242ac130003",
  entry_title: "Test New Entry",
  entry_category: "Test Entry Category",
  entry_chapters: "1",
  entry_pages: "1-10",
  entry_quote: "Test Quote",
  entry_notes: "Test Entry Notes",
};

const newReview = {
  review_book_id: "54703712-cae4-11eb-b8bc-0242ac130003",
  review_date_finished: "2021-06-11",
  review_rating: "5",
  review_favorite: "Test Review Favorite",
  review_dislike: "Test Review Dislike",
  review_takeaway: "Test Review Takeaway",
  review_notes: "Test Review Notes",
  review_recommend: false,
};

const testIds = {
  book: "4a3ae350-cae4-11eb-b8bc-0242ac130003",
  entry: "b88913c2-cae4-11eb-b8bc-0242ac130003",
  review: "8f46731e-cb17-11eb-b8bc-0242ac130003",
};

module.exports = {
  makeBooksArray,
  makeEntriesArray,
  makeReviewsArray,
  makeMaliciousBook,
  makeMaliciousEntry,
  makeMaliciousReview,
  testIds,
};
