CREATE TYPE "public"."shopping_item_status" AS ENUM('pending', 'purchased');--> statement-breakpoint
CREATE TABLE "shopping_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"category" text,
	"quantity" double precision,
	"unit" text,
	"estimated_price" double precision,
	"status" "shopping_item_status" DEFAULT 'pending' NOT NULL,
	"note" text,
	"purchased_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
