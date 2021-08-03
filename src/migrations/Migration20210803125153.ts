import { Migration } from '@mikro-orm/migrations';

export class Migration20210803125153 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column IF NOT EXISTS "email" text not null;');
    this.addSql('alter table "user" drop constraint  IF EXISTS "user_email_unique"');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
    this.addSql('alter table "post" drop column "content";');
  
  }

}
