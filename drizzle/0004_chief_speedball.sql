CREATE TYPE "public"."budget_type" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"type" "budget_type" DEFAULT 'monthly' NOT NULL,
	"monthly_limit" double precision NOT NULL,
	"weekly_limit" double precision,
	"daily_limit" double precision,
	"start_date" text,
	"end_date" text,
	"status" "budget_status",
	"note" text,
	"extra_note" text,
	"color" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
