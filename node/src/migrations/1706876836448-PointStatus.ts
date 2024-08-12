import { MigrationInterface, QueryRunner } from 'typeorm';

export class PointStatus1706876836448 implements MigrationInterface {
  name = ' PointStatus1706876836448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "points_status" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateAwarded" TIMESTAMP NOT NULL DEFAULT now(), "userId" character varying NOT NULL, CONSTRAINT "PK_201a399a5557f4caad31cf9a188" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "points_status"`);
  }
}
