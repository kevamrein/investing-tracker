import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "investment" ADD COLUMN "investor_mapping_id" integer NOT NULL;
  DO $$ BEGIN
   ALTER TABLE "investment" ADD CONSTRAINT "investment_investor_mapping_id_investors_id_fk" FOREIGN KEY ("investor_mapping_id") REFERENCES "public"."investors"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "investment_investor_mapping_idx" ON "investment" USING btree ("investor_mapping_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "investment" DROP CONSTRAINT "investment_investor_mapping_id_investors_id_fk";
  
  DROP INDEX IF EXISTS "investment_investor_mapping_idx";
  ALTER TABLE "investment" DROP COLUMN IF EXISTS "investor_mapping_id";`)
}
