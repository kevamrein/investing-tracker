import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_option_opportunities_sector" AS ENUM('technology', 'communication', 'healthcare', 'financial', 'consumer', 'other');
  CREATE TYPE "public"."enum_option_opportunities_status" AS ENUM('pending', 'traded', 'dismissed', 'expired');
  CREATE TYPE "public"."enum_option_paper_trades_exit_reason" AS ENUM('profit_target', 'stop_loss', 'time_stop', 'day1_circuit_breaker', 'manual');
  CREATE TYPE "public"."enum_option_paper_trades_status" AS ENUM('pending', 'open', 'closed', 'cancelled');
  CREATE TYPE "public"."enum_option_alerts_delivery_methods_method" AS ENUM('email', 'in_app');
  CREATE TYPE "public"."enum_option_alerts_alert_type" AS ENUM('new_opportunity', 'profit_target', 'stop_loss', 'position_update', 'daily_summary');
  CREATE TABLE "option_opportunities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"opportunity_id" varchar NOT NULL,
  	"ticker" varchar NOT NULL,
  	"company_name" varchar,
  	"investor_id" integer NOT NULL,
  	"earnings_date" timestamp(3) with time zone NOT NULL,
  	"identified_date" timestamp(3) with time zone NOT NULL,
  	"drop_pct" numeric NOT NULL,
  	"eps_beat_pct" numeric NOT NULL,
  	"score" numeric NOT NULL,
  	"pre_earnings_price" numeric,
  	"post_earnings_price" numeric,
  	"current_price" numeric,
  	"market_cap" numeric,
  	"sector" "enum_option_opportunities_sector",
  	"status" "enum_option_opportunities_status" DEFAULT 'pending' NOT NULL,
  	"strategy" varchar DEFAULT 'beat_drop_recovery',
  	"notes" varchar,
  	"display_title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "option_paper_trades" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"trade_id" varchar NOT NULL,
  	"ticker" varchar NOT NULL,
  	"investor_id" integer NOT NULL,
  	"opportunity_id" integer,
  	"earnings_date" timestamp(3) with time zone NOT NULL,
  	"identified_date" timestamp(3) with time zone NOT NULL,
  	"drop_pct" numeric NOT NULL,
  	"eps_beat_pct" numeric NOT NULL,
  	"score" numeric NOT NULL,
  	"entry_date" timestamp(3) with time zone,
  	"stock_price_at_entry" numeric,
  	"strike_price" numeric,
  	"entry_premium" numeric,
  	"contracts" numeric DEFAULT 1 NOT NULL,
  	"dte_at_entry" numeric,
  	"exit_date" timestamp(3) with time zone,
  	"stock_price_at_exit" numeric,
  	"exit_premium" numeric,
  	"exit_reason" "enum_option_paper_trades_exit_reason",
  	"status" "enum_option_paper_trades_status" DEFAULT 'pending' NOT NULL,
  	"position_size_pct" numeric DEFAULT 2,
  	"pnl_dollars" numeric,
  	"pnl_percent" numeric,
  	"holding_days" numeric,
  	"strategy" varchar DEFAULT 'beat_drop_recovery',
  	"notes" varchar,
  	"display_title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "option_alerts_delivery_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"method" "enum_option_alerts_delivery_methods_method" NOT NULL
  );
  
  CREATE TABLE "option_alerts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"investor_id" integer NOT NULL,
  	"alert_type" "enum_option_alerts_alert_type" NOT NULL,
  	"min_score" numeric DEFAULT 85,
  	"email_address" varchar,
  	"enabled" boolean DEFAULT true,
  	"last_triggered" timestamp(3) with time zone,
  	"trigger_count" numeric DEFAULT 0,
  	"display_title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "option_opportunities_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "option_paper_trades_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "option_alerts_id" integer;
  ALTER TABLE "option_opportunities" ADD CONSTRAINT "option_opportunities_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "option_paper_trades" ADD CONSTRAINT "option_paper_trades_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "option_paper_trades" ADD CONSTRAINT "option_paper_trades_opportunity_id_option_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."option_opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "option_alerts_delivery_methods" ADD CONSTRAINT "option_alerts_delivery_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."option_alerts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "option_alerts" ADD CONSTRAINT "option_alerts_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "option_opportunities_opportunity_id_idx" ON "option_opportunities" USING btree ("opportunity_id");
  CREATE INDEX "option_opportunities_ticker_idx" ON "option_opportunities" USING btree ("ticker");
  CREATE INDEX "option_opportunities_investor_idx" ON "option_opportunities" USING btree ("investor_id");
  CREATE INDEX "option_opportunities_earnings_date_idx" ON "option_opportunities" USING btree ("earnings_date");
  CREATE INDEX "option_opportunities_score_idx" ON "option_opportunities" USING btree ("score");
  CREATE INDEX "option_opportunities_status_idx" ON "option_opportunities" USING btree ("status");
  CREATE INDEX "option_opportunities_updated_at_idx" ON "option_opportunities" USING btree ("updated_at");
  CREATE INDEX "option_opportunities_created_at_idx" ON "option_opportunities" USING btree ("created_at");
  CREATE UNIQUE INDEX "option_paper_trades_trade_id_idx" ON "option_paper_trades" USING btree ("trade_id");
  CREATE INDEX "option_paper_trades_ticker_idx" ON "option_paper_trades" USING btree ("ticker");
  CREATE INDEX "option_paper_trades_investor_idx" ON "option_paper_trades" USING btree ("investor_id");
  CREATE INDEX "option_paper_trades_opportunity_idx" ON "option_paper_trades" USING btree ("opportunity_id");
  CREATE INDEX "option_paper_trades_entry_date_idx" ON "option_paper_trades" USING btree ("entry_date");
  CREATE INDEX "option_paper_trades_status_idx" ON "option_paper_trades" USING btree ("status");
  CREATE INDEX "option_paper_trades_updated_at_idx" ON "option_paper_trades" USING btree ("updated_at");
  CREATE INDEX "option_paper_trades_created_at_idx" ON "option_paper_trades" USING btree ("created_at");
  CREATE INDEX "option_alerts_delivery_methods_order_idx" ON "option_alerts_delivery_methods" USING btree ("_order");
  CREATE INDEX "option_alerts_delivery_methods_parent_id_idx" ON "option_alerts_delivery_methods" USING btree ("_parent_id");
  CREATE INDEX "option_alerts_investor_idx" ON "option_alerts" USING btree ("investor_id");
  CREATE INDEX "option_alerts_updated_at_idx" ON "option_alerts" USING btree ("updated_at");
  CREATE INDEX "option_alerts_created_at_idx" ON "option_alerts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_option_opportunities_fk" FOREIGN KEY ("option_opportunities_id") REFERENCES "public"."option_opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_option_paper_trades_fk" FOREIGN KEY ("option_paper_trades_id") REFERENCES "public"."option_paper_trades"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_option_alerts_fk" FOREIGN KEY ("option_alerts_id") REFERENCES "public"."option_alerts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_option_opportunities_id_idx" ON "payload_locked_documents_rels" USING btree ("option_opportunities_id");
  CREATE INDEX "payload_locked_documents_rels_option_paper_trades_id_idx" ON "payload_locked_documents_rels" USING btree ("option_paper_trades_id");
  CREATE INDEX "payload_locked_documents_rels_option_alerts_id_idx" ON "payload_locked_documents_rels" USING btree ("option_alerts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "option_opportunities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "option_paper_trades" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "option_alerts_delivery_methods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "option_alerts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "option_opportunities" CASCADE;
  DROP TABLE "option_paper_trades" CASCADE;
  DROP TABLE "option_alerts_delivery_methods" CASCADE;
  DROP TABLE "option_alerts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_option_opportunities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_option_paper_trades_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_option_alerts_fk";
  
  DROP INDEX "payload_locked_documents_rels_option_opportunities_id_idx";
  DROP INDEX "payload_locked_documents_rels_option_paper_trades_id_idx";
  DROP INDEX "payload_locked_documents_rels_option_alerts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "option_opportunities_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "option_paper_trades_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "option_alerts_id";
  DROP TYPE "public"."enum_option_opportunities_sector";
  DROP TYPE "public"."enum_option_opportunities_status";
  DROP TYPE "public"."enum_option_paper_trades_exit_reason";
  DROP TYPE "public"."enum_option_paper_trades_status";
  DROP TYPE "public"."enum_option_alerts_delivery_methods_method";
  DROP TYPE "public"."enum_option_alerts_alert_type";`)
}
