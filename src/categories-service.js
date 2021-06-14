const CategoriesService = {
  getAllCategories(knex) {
    return knex.select("*").from("earlybird_categories");
  },

  // deleteCategory(knex, category) {
  //   return knex("earlybird_categories").where({ category }).delete();
  // },

  // updateCategory(knex, category, updatedCategory) {
  //   return knex("earlybird_categories")
  //     .where({ category })
  //     .update(updatedCategory);
  // },

  // insertCategory(knex, newCategory) {
  //   return knex
  //     .insert(newCategory)
  //     .into("earlybird_categories")
  //     .returning("*")
  //     .then((rows) => {
  //       return rows[0];
  //     });
  // },
};

module.exports = CategoriesService;
