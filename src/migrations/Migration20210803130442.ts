import { Migration } from '@mikro-orm/migrations';

export class Migration20210803130442 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" drop column "content";');
  }

}
