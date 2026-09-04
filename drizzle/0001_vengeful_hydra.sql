CREATE TYPE "public"."ai_provider" AS ENUM('off', 'free-api', 'local');--> statement-breakpoint
CREATE TYPE "public"."budget_category_status" AS ENUM('active', 'pushed', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."budget_category_type" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."budget_status" AS ENUM('active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."expense_source_type" AS ENUM('manual', 'image', 'text', 'recurring');--> statement-breakpoint
CREATE TYPE "public"."routine_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."routine_repeat_rule" AS ENUM('daily', 'weekly', 'custom', 'once');--> statement-breakpoint
CREATE TYPE "public"."routine_status" AS ENUM('pending', 'active', 'completed', 'skipped', 'delayed', 'missed');--> statement-breakpoint
CREATE TYPE "public"."timer_mode" AS ENUM('timer', 'stopwatch', 'focus');--> statement-breakpoint
CREATE TABLE "budget_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "budget_category_type" DEFAULT 'monthly' NOT NULL,
	"monthly_limit" double precision NOT NULL,
	"weekly_limit" double precision,
	"daily_limit" double precision,
	"start_date" text,
	"end_date" text,
	"status" "budget_status",
	"category_status" "budget_category_status",
	"note" text,
	"extra_note" text,
	"color" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"item_name" text NOT NULL,
	"category" text NOT NULL,
	"amount" double precision NOT NULL,
	"quantity" double precision,
	"unit" text,
	"payment_method" text,
	"note" text,
	"source_type" "expense_source_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"profile_name" text NOT NULL,
	"profile_email" text NOT NULL,
	"profile_phone" text NOT NULL,
	"profile_location" text NOT NULL,
	"profile_role" text NOT NULL,
	"profile_bio" text NOT NULL,
	"profile_image" text NOT NULL,
	"currency" text NOT NULL,
	"notification_enabled" boolean DEFAULT false NOT NULL,
	"quiet_hours_start" text NOT NULL,
	"quiet_hours_end" text NOT NULL,
	"ai_provider" "ai_provider" DEFAULT 'off' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"priority" "routine_priority" DEFAULT 'medium' NOT NULL,
	"planned_start" text NOT NULL,
	"planned_end" text NOT NULL,
	"sort_order" integer,
	"actual_minutes" integer,
	"status" "routine_status" DEFAULT 'pending' NOT NULL,
	"repeat_rule" "routine_repeat_rule" DEFAULT 'daily' NOT NULL,
	"alert_enabled" boolean,
	"alert_offset_minutes" integer,
	"reminder_at" text,
	"completed_at" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timer_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"mode" timer_mode NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
