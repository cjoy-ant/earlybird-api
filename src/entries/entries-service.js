const EntriesService = {
  getAllEntries(knex) {
    return knex.select("*").from("earlybird_entries");
  },

  getById(knex, entry_id) {
    return knex
      .from("earlybird_entries")
      .select("*")
      .where("entry_id", entry_id)
      .first();
  },

  deleteEntry(knex, entry_id) {
    return knex("earlybird_entries").where({ entry_id }).delete();
  },

  updateEntry(knex, entry_id, newEntryFields) {
    return knex("earlybird_entries").where({ entry_id }).update(newEntryFields);
  },

  insertEntry(knex, newEntry) {
    return knex
      .insert(newEntry)
      .into("earlybird_entries")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = EntriesService;
