CREATE TYPE "public"."meal_status" AS ENUM('planned', 'prepared', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'snack');--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"date" text NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"title" text NOT NULL,
	"servings" integer DEFAULT 1 NOT NULL,
	"prep_minutes" integer,
	"calories" double precision,
	"protein_grams" double precision,
	"carbs_grams" double precision,
	"fat_grams" double precision,
	"ingredients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"shopping_needed" boolean DEFAULT false NOT NULL,
	"note" text,
	"status" "meal_status" DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
