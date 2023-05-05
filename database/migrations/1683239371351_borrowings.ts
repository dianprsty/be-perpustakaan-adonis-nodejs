import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import { DateTime } from "luxon";

export default class extends BaseSchema {
  protected tableName = "borrowings";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.date("tanggal_pinjam").defaultTo(this.now());
      table
        .date("tanggal_kembali")
        .defaultTo(DateTime.local().plus({ days: 7 }));
      table.boolean("is_returned");

      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .integer("book_id")
        .unsigned()
        .references("id")
        .inTable("books")
        .onDelete("CASCADE");

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
