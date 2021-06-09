const BooksService = {
  getAllBooks(knex) {
    return knex.select("*").from("earlybird_books");
  },

  getById(knex, book_id) {
    return knex
      .from("earlybird_books")
      .select("*")
      .where("book_id", book_id)
      .first();
  },

  deleteBook(knex, book_id) {
    return knex("earlybird_books").where({ book_id }).delete();
  },

  updateBook(knex, book_id, newBookFields) {
    return knex("earlybird_books").where({ book_id }).update(newBookFields);
  },

  insertBook(knex, newProvider) {
    return knex
      .insert(newProvider)
      .into("earlybird_books")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = BooksService;
