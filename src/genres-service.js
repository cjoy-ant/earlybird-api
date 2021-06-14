const GenresService = {
  getAllGenres(knex) {
    return knex.select("*").from("earlybird_genres");
  },
};

module.exports = GenresService;
