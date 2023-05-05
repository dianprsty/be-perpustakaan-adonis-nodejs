import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "books";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer("stock");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("stock");
    });
  }
}
