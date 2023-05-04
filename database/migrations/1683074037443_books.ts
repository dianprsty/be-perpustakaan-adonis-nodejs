import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "books";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("judul");
      table.text("ringkasan", "longtext");
      table.string("tahun_terbit", 4);
      table.integer("halaman");
      table.integer("kategori_id").unsigned();
      table.foreign("kategori_id").references("categories.id");

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamps(true, true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
