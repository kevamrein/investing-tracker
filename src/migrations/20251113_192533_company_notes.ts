import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  DROP INDEX "payload_locked_documents_rels_investment_recommendation_id_idx";
  ALTER TABLE "investment" ALTER COLUMN "investor_id" DROP NOT NULL;
  ALTER TABLE "company" ADD COLUMN "notes" varchar;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE UNIQUE INDEX "company_name_idx" ON "company" USING btree ("name");
  CREATE UNIQUE INDEX "company_ticker_idx" ON "company" USING btree ("ticker");
  CREATE INDEX "payload_locked_documents_rels_investment_recommendation__idx" ON "payload_locked_documents_rels" USING btree ("investment_recommendation_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_kv" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP INDEX "company_name_idx";
  DROP INDEX "company_ticker_idx";
  DROP INDEX "payload_locked_documents_rels_investment_recommendation__idx";
  ALTER TABLE "investment" ALTER COLUMN "investor_id" SET NOT NULL;
  CREATE INDEX "payload_locked_documents_rels_investment_recommendation_id_idx" ON "payload_locked_documents_rels" USING btree ("investment_recommendation_id");
  ALTER TABLE "company" DROP COLUMN "notes";`)
}
