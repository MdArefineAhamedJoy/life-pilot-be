ALTER TABLE "budget_categories" ADD COLUMN "subcategories" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "sub_category" text;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "model" text;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "store_name" text;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "product_price" double precision;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "total_price" double precision;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "purchase_date" text;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "receipt_documents" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "warranty_status" text;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "warranty_expires_at" text;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "warranty_note" text;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "warranty_documents" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD COLUMN "expense_id" text;