import { MigrationInterface, QueryRunner } from 'typeorm';

export class TraitEnrolmentStatus1706786006561 implements MigrationInterface {
  name = ' TraitEnrolmentStatus1706786006561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_trait" ADD "status" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_trait" DROP COLUMN "status"`);
  }
}
