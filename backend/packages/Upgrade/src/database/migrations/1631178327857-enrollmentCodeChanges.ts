import {MigrationInterface, QueryRunner} from 'typeorm';

export class enrollmentCodeChanges1631178327857 implements MigrationInterface {
    public name = 'enrollmentCodeChanges1631178327857';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "monitored_experiment_point" DROP COLUMN "enrollmentCode"`);
        await queryRunner.query(`DROP TYPE "public"."monitored_experiment_point_enrollmentcode_enum"`);
        await queryRunner.query(`CREATE TYPE "individual_assignment_enrollmentcode_enum" AS ENUM('Student included in experiment', 'Student reached experiment point prior to experiment enrolling', 'Student was on exclusion list', 'GROUP was on exclusion list')`);
        await queryRunner.query(`ALTER TABLE "individual_assignment" ADD "enrollmentCode" "individual_assignment_enrollmentcode_enum"`);
        await queryRunner.query(`CREATE TYPE "individual_exclusion_enrollmentcode_enum" AS ENUM('Student included in experiment', 'Student reached experiment point prior to experiment enrolling', 'Student was on exclusion list', 'GROUP was on exclusion list')`);
        await queryRunner.query(`ALTER TABLE "individual_exclusion" ADD "enrollmentCode" "individual_exclusion_enrollmentcode_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "individual_exclusion" DROP COLUMN "enrollmentCode"`);
        await queryRunner.query(`DROP TYPE "individual_exclusion_enrollmentcode_enum"`);
        await queryRunner.query(`ALTER TABLE "individual_assignment" DROP COLUMN "enrollmentCode"`);
        await queryRunner.query(`DROP TYPE "individual_assignment_enrollmentcode_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."monitored_experiment_point_enrollmentcode_enum" AS ENUM('GROUP was on exclusion list', 'Student included in experiment', 'Student reached experiment point prior to experiment enrolling', 'Student was on exclusion list')`);
        await queryRunner.query(`ALTER TABLE "monitored_experiment_point" ADD "enrollmentCode" "monitored_experiment_point_enrollmentcode_enum"`);
    }

}
