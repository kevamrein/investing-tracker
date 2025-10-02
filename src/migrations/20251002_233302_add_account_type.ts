import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_investment_account_type" AS ENUM('taxable', 'ira');
  ALTER TABLE "investment" ADD COLUMN "account_type" "enum_investment_account_type" DEFAULT 'taxable' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "investment" DROP COLUMN IF EXISTS "account_type";
  DROP TYPE "public"."enum_investment_account_type";`)
}
