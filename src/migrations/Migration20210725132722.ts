import { Migration } from '@mikro-orm/migrations';

export class Migration20210725132722 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" add column IF NOT EXISTS "content" text null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" drop column "content";');
  }
}
